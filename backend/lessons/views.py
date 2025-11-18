from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Lesson, LessonCompletion
from courses.models import Course
from .serializers import LessonSerializer, LessonCompletionSerializer, StudentGradeSerializer
from django.utils import timezone
from django.contrib.auth import get_user_model
# Create your views here.

class LessonListView(generics.ListAPIView):
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        course_id = self.kwargs["course_id"]
        course = get_object_or_404(Course, id=course_id)
        user = self.request.user

        if user.role == "student":
            # Return all published lessons so the UI can show locked ones.
            return Lesson.objects.filter(course=course, status="published")

        elif user.role == "teacher":
            # Teachers can view lessons for any course
            return Lesson.objects.filter(course=course)

        raise PermissionDenied("Not allowed to view lessons")
    
class LessonCreateView(generics.CreateAPIView):
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user

        if not user.role == "teacher":
            raise PermissionDenied("Only teachers can create lessons")

        course_id = self.kwargs.get("course_id")
        course = get_object_or_404(Course, id=course_id)

        # Enforce that total lesson credits cannot exceed course total (only if set > 0)
        credit = float(serializer.validated_data.get("credit_value", 0) or 0)
        if float(course.total_credits or 0) > 0:
            from django.db.models import Sum
            existing = course.lessons.aggregate(Sum("credit_value"))["credit_value__sum"] or 0.0
            if existing + credit > float(course.total_credits):
                raise ValidationError({
                    "credit_value": "Adding this lesson would exceed the course's total credits."
                })

        serializer.save(author=user, course=course)

class LessonDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "teacher":
            # Teachers can access all lessons
            return Lesson.objects.all()
        elif user.role == "student":
            return Lesson.objects.filter(status="published")
        return Lesson.objects.none()

    def perform_update(self, serializer):
        user = self.request.user
        lesson = self.get_object()
        if not user.role == "teacher":
            raise PermissionDenied("Only teachers can edit lessons")
        new_credit = serializer.validated_data.get("credit_value")
        if new_credit is not None and float(lesson.course.total_credits or 0) > 0:
            from django.db.models import Sum
            course = lesson.course
            other_sum = course.lessons.exclude(id=lesson.id).aggregate(Sum("credit_value"))["credit_value__sum"] or 0.0
            if other_sum + float(new_credit or 0) > float(course.total_credits):
                raise ValidationError({
                    "credit_value": "Updating this lesson would exceed the course's total credits."
                })
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if not user.role == "teacher":
            raise PermissionDenied("Only teachers can delete lessons")

        # Allow deleting draft lessons even if the course has active students
        if instance.status != "draft" and instance.course.enrollments.filter(role="student", status="active").exists():
            raise PermissionDenied("Cannot delete lesson with active students")
        instance.delete()

class LessonStatusUpdateView(APIView): # Archive and republish views merged

    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        lesson = get_object_or_404(Lesson, pk=pk)
        user = self.request.user

        if not user.role == "teacher":
            raise PermissionDenied("Only teachers can change lesson status")

        new_status = request.data.get("new_status") 

        if new_status == "archive":
            if lesson.course.enrollments.filter(role="student", status="active").exists():
                raise PermissionDenied("Cannot archive a lesson with active students enrolled")
            lesson.status = "archived"

        elif new_status == "republish":
            if lesson.status != "archived":
                raise PermissionDenied("Only archived lessons can be republished")
            lesson.status = "published"

        elif new_status == "draft":
            # Moving a lesson to draft
            if lesson.course.enrollments.filter(role="student", status="active").exists():
                raise PermissionDenied("Cannot move a lesson with active students to draft")
            lesson.status = "draft"

        elif new_status == "publish":
            if lesson.status != "draft":
                raise PermissionDenied("Only lessons in draft can be published")
            lesson.status = "published"

        else:
            return Response({"detail": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)

        lesson.save(update_fields=["status", "updated_at"])
        return Response({"detail": f"Course status changed to {lesson.status}"}, status=status.HTTP_200_OK)


class LessonCompletionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id, pk):
        lesson = get_object_or_404(Lesson, pk=pk, course_id=course_id)
        user = request.user
        if user.role != "student":
            raise PermissionDenied("Only students can mark lessons completed")

        LessonCompletion.objects.get_or_create(student=user, lesson=lesson)
        return Response({"detail": f"Lesson '{lesson.title}' marked completed"}, status=201)

    def delete(self, request, course_id, pk):
        lesson = get_object_or_404(Lesson, pk=pk, course_id=course_id)
        user = request.user
        if user.role != "student":
            raise PermissionDenied("Only students can unmark lessons")

        LessonCompletion.objects.filter(student=user, lesson=lesson).delete()
        return Response({"detail": f"Lesson '{lesson.title}' unmarked"}, status=200)


class LessonCompletedStudentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id, pk):
        if request.user.role != "teacher":
            raise PermissionDenied("Only teachers can view completions")
        lesson = get_object_or_404(Lesson, pk=pk, course_id=course_id)
        completions = LessonCompletion.objects.filter(lesson=lesson).select_related("student")
        data = LessonCompletionSerializer(completions, many=True).data
        return Response(data, status=200)


class LessonGradeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id, pk):
        if request.user.role != "teacher":
            raise PermissionDenied("Only teachers can grade")
        lesson = get_object_or_404(Lesson, pk=pk, course_id=course_id)
        student_id = request.data.get("student_id")
        grade = request.data.get("grade")
        comment = request.data.get("comment", "")
        if grade not in ["HD", "D", "C", "P", "F"]:
            raise ValidationError({"grade": "Invalid grade"})
        completion = get_object_or_404(LessonCompletion, lesson=lesson, student_id=student_id)
        completion.grade = grade
        completion.graded_at = timezone.now()
        completion.comment = comment
        completion.save(update_fields=["grade", "graded_at", "comment"])
        return Response({"detail": "Grade saved"}, status=200)


class MyLessonCompletionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        course_id = request.query_params.get("course_id")
        qs = LessonCompletion.objects.filter(student=request.user, lesson__course__status__in=["draft", "published"]).select_related("lesson", "lesson__course")
        if course_id:
            qs = qs.filter(lesson__course_id=course_id)
        data = StudentGradeSerializer(qs, many=True).data
        return Response(data, status=200)


class StudentCourseCompletionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id, student_id):
        # Only teachers can view another student's stats
        if request.user.role != "teacher":
            raise PermissionDenied("Only teachers can view student stats")

        course = get_object_or_404(Course, id=course_id)
        User = get_user_model()
        student = get_object_or_404(User, id=student_id)

        comps = (
            LessonCompletion.objects
            .filter(student=student, lesson__course=course)
            .select_related("lesson")
            .order_by("lesson__id")
        )

        # Build completions payload
        comp_list = []
        completed_credits = 0.0
        for c in comps:
            credit = float(getattr(c.lesson, "credit_value", 0.0) or 0.0)
            completed_credits += credit
            comp_list.append({
                "lesson_id": c.lesson.id,
                "lesson_title": c.lesson.title,
                "grade": c.grade,
                "comment": c.comment or "",
                "completed_at": c.completed_at,
            })

        total = float(course.total_credits or 0.0)
        pct = 0.0
        if total > 0:
            pct = (completed_credits / total) * 100.0

        # Build student avatar URL if available
        avatar_url = None
        try:
            if getattr(student, 'avatar', None):
                url = student.avatar.url
                avatar_url = request.build_absolute_uri(url) if hasattr(request, 'build_absolute_uri') else url
        except Exception:
            avatar_url = None

        payload = {
            "course_id": course.id,
            "course_title": course.title,
            "total_credits": total,
            "completed_credits": completed_credits,
            "progress_percentage": round(pct, 1),
            "student_id": student.id,
            "student_name": f"{getattr(student, 'first_name', '')} {getattr(student, 'last_name', '')}".strip() or student.email,
            "student_email": student.email,
            "student_avatar_url": avatar_url,
            "completions": comp_list,
        }
        return Response(payload, status=200)


class CourseGPAView(APIView):
    """
    Calculate GPA for a student in a specific course based on graded lessons.
    Only students can view their own GPA.
    
    Grade to GPA mapping (0-4.0 scale):
    - HD (High Distinction): 4.0
    - D (Distinction): 3.0
    - C (Credit): 2.0
    - P (Pass): 1.0
    - F (Fail): 0.0
    """
    permission_classes = [IsAuthenticated]
    
    GRADE_TO_GPA = {
        "HD": 4.0,
        "D": 3.0,
        "C": 2.0,
        "P": 1.0,
        "F": 0.0,
    }
    
    def get(self, request, course_id):
        user = request.user
        
        # Only students can view their GPA
        if user.role != "student":
            return Response(
                {"detail": "Only students can view GPA"},
                status=403
            )
        
        # Get the course
        course = get_object_or_404(Course, id=course_id)
        
        # Get all graded lesson completions for this student in this course
        graded_completions = LessonCompletion.objects.filter(
            student=user,
            lesson__course=course,
            grade__isnull=False  # Only include lessons that have been graded
        ).select_related("lesson")
        
        # Calculate GPA
        if not graded_completions.exists():
            return Response({
                "course_id": course.id,
                "course_title": course.title,
                "gpa": None,
                "graded_lessons_count": 0,
                "total_lessons_count": course.lessons.filter(status="published").count(),
                "message": "No graded lessons yet"
            })
        
        # Calculate weighted GPA based on credit values
        total_credits = 0.0
        weighted_sum = 0.0
        
        for completion in graded_completions:
            grade_point = self.GRADE_TO_GPA.get(completion.grade, 0.0)
            credit_value = float(completion.lesson.credit_value or 1.0)  # Default to 1.0 if no credit value
            
            weighted_sum += grade_point * credit_value
            total_credits += credit_value
        
        # Calculate final GPA
        gpa = weighted_sum / total_credits if total_credits > 0 else 0.0
        
        return Response({
            "course_id": course.id,
            "course_title": course.title,
            "gpa": round(gpa, 2),
            "graded_lessons_count": graded_completions.count(),
            "total_lessons_count": course.lessons.filter(status="published").count(),
            "grade_breakdown": {
                grade: graded_completions.filter(grade=grade).count()
                for grade in ["HD", "D", "C", "P", "F"]
            }
        })
