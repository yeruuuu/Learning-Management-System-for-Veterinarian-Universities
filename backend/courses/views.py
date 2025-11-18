import django
from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, permissions
from django.db.models import Avg


from .serializers import CourseSerializer, CourseEnrollmentSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from .models import Course, CourseEnrollment
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from accounts.permissions import IsTeacherOrAdmin
from lessons.models import Lesson, LessonCompletion
from .models import Course


class CourseListView(generics.ListAPIView): #using ListAPIView  to return a list of all the courses
    
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user


        #getting either the 
        if user.role == "teacher":
            enrolled_ids = CourseEnrollment.objects.filter(
                user=user, role="teacher", status="active"
            ).values_list("course_id", flat=True)
            return Course.objects.filter(id__in=enrolled_ids).exclude(status="archived")

        else:  
            enrolled_ids = CourseEnrollment.objects.filter(
                user=user, role="student", status="active"
            ).values_list("course_id", flat=True)
            return Course.objects.filter(id__in=enrolled_ids).exclude(status="archived")


class AvailableCoursesView(generics.ListAPIView): #ListAPIView will return a list of all the courses
    #List published courses available for students to enroll in.
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # if not user.is_student():
        #     raise PermissionDenied("Only students can view available courses")

        enrolled_ids = CourseEnrollment.objects.filter(
            user=user, status="active"
        ).values_list("course_id", flat=True)

        return Course.objects.filter(status="published").exclude(id__in=enrolled_ids)


class CourseCreateView(generics.CreateAPIView): #CreateAPIView will make a request for all data, validate it, save it, return it
    #Teachers create new courses (auto-enrolls as teacher).
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        if not self.request.user.role == "teacher":
            raise PermissionDenied("Only teachers can create courses")

        course = serializer.save()

        CourseEnrollment.objects.create(
            user=self.request.user,
            course=course,
            role="teacher",
            status="active"
        )


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView): #Allows you to retrieve, update(edit) or delete a course (CRUD)
    #Retrieve, update, or delete a course.
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == "teacher":
            return Course.objects.all()

        enrolled_ids = CourseEnrollment.objects.filter(
            user=user, status="active"
        ).values_list("course_id", flat=True)
        return Course.objects.filter(id__in=enrolled_ids).exclude(status="archived")

    def perform_destroy(self, serializer): # allows teachers to edit courses that are empty
        if not self.request.user.role == "teacher":
            raise PermissionDenied("Only teachers can edit courses")

        course = self.get_object()
        if course.enrollments.filter(role="student", status="active").exists():
            raise PermissionDenied("Cannot edit course with active students enrolled")

        serializer.save()

    def delete_course(self, instance): # allows teachers to delete courses that are empty
        if not self.request.user.role == "teacher":
            raise PermissionDenied("Only teachers can delete courses")

        if instance.enrollments.filter(role="student", status="active").exists():
            raise PermissionDenied("Cannot delete course with active students enrolled")

        instance.delete()


class CourseArchiveView(APIView): #APIView is just a base class view
    #Archive a course 
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        course = get_object_or_404(Course, pk=pk)

        if not request.user.role == "teacher":
            raise PermissionDenied("Only teachers can archive courses")

        if course.enrollments.filter(role="student", status="active").exists():
            raise PermissionDenied("Cannot archive a course with active students enrolled")

        course.status = "archived"
        course.save(update_fields=["status", "updated_at"])
        return Response({"detail": "Course archived successfully"}, status=status.HTTP_200_OK)


class CourseRepublishView(APIView): #APIView is just a base class view
    #Republish an archived course.
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        course = get_object_or_404(Course, pk=pk)

        if not request.user.role == "teacher":
            raise PermissionDenied("Only teachers can republish courses")

        if course.status != "archived":
            raise PermissionDenied("Only archived courses can be republished")

        # Enforce publishing rule: published lesson credits must meet/exceed course total
        if not course.can_publish():
            return Response(
                {"detail": "Cannot publish course: published lesson credits have not met the course total."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        course.status = "published"
        course.save(update_fields=["status", "updated_at"])
        return Response({"detail": "Course republished successfully"}, status=status.HTTP_200_OK)


class CourseEnrollmentCreateView(generics.CreateAPIView): #CreateAPIView will make a request for all data, validate it, save it, return it
    #Enroll a user (student or teacher) into a course.
    serializer_class = CourseEnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        course = serializer.validated_data["course"]
        if user.role == "teacher":
            role = "teacher"
        else:
            role = "student"

        if CourseEnrollment.objects.filter(user=user, course=course, role=role).exists():
            raise PermissionDenied("You are already enrolled in this course")

        serializer.save(user=user, role=role, status="active")


class CourseStudentsView(generics.GenericAPIView):
    """Get all students enrolled in a course"""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk, *args, **kwargs):
        from django.contrib.auth import get_user_model
        from accounts.serializers import UserSerializer
        
        User = get_user_model()
        
        # Check if course exists
        try:
            course = Course.objects.get(id=pk)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if user is a teacher for this course
        if request.user.role == "teacher":
            is_course_teacher = CourseEnrollment.objects.filter(
                user=request.user,
                course=course,
                role="teacher",
                status="active"
            ).exists()
            
            if not is_course_teacher:
                return Response(
                    {"error": "Only teachers of this course can view the student list"},
                    status=status.HTTP_403_FORBIDDEN
                )
        else:
            return Response(
                {"error": "Only teachers can view the student list"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get all students enrolled in this course (including inactive/banned)
        student_enrollments = CourseEnrollment.objects.filter(
            course=course,
            role="student"
        ).select_related('user')
        
        # Build student list with enrollment status
        students_data = []
        for enrollment in student_enrollments:
            user_data = UserSerializer(enrollment.user).data
            user_data['enrollment_status'] = enrollment.status
            students_data.append(user_data)
        
        return Response({
            "course_id": course.id,
            "course_title": course.title,
            "students": students_data,
            "total_students": len(students_data)
        }, status=status.HTTP_200_OK)


class ArchivedCoursesView(generics.ListAPIView):
    """List all archived courses for a user"""
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # Get archived enrollments for the user
        archived_ids = CourseEnrollment.objects.filter(
            user=user,
            role=user.role,
            status="archived"
        ).values_list("course_id", flat=True)
        
        return Course.objects.filter(id__in=archived_ids)


class CourseEnrollmentArchiveView(APIView):
    """Archive or unarchive a user's course enrollment"""
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):
        user = request.user
        
        # Check if course exists
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Get the user's enrollment
        try:
            # Determine role - check if teacher first, then student
            enrollment = CourseEnrollment.objects.get(
                user=user,
                course=course,
                role=user.role
            )
        except CourseEnrollment.DoesNotExist:
            return Response(
                {"error": "You are not enrolled in this course"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Toggle archive status
        if enrollment.status == "archived":
            enrollment.status = "active"
            message = "Course unarchived successfully"
        else:
            enrollment.status = "archived"
            message = "Course archived successfully"
        
        enrollment.save()
        
        return Response({
            "message": message,
            "status": enrollment.status
        }, status=status.HTTP_200_OK)


class CourseWithdrawView(APIView):
    """Allow students to withdraw from a course"""
    permission_classes = [IsAuthenticated]

    def delete(self, request, course_id):
        user = request.user
        
        # Only students can withdraw
        if user.role != "student":
            return Response(
                {"error": "Only students can withdraw from courses"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if course exists
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Get the student's enrollment
        try:
            enrollment = CourseEnrollment.objects.get(
                user=user,
                course=course,
                role="student",
                status="active"
            )
        except CourseEnrollment.DoesNotExist:
            return Response(
                {"error": "You are not enrolled in this course"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Delete the enrollment
        enrollment.delete()
        
        return Response({
            "message": "Successfully withdrawn from course",
            "course_id": course_id
        }, status=status.HTTP_200_OK)


class StudentCourseProgressView(generics.GenericAPIView):
    """Get a specific student's progress in a course (for teachers)"""
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id, student_id, *args, **kwargs):
        from django.contrib.auth import get_user_model
        from lessons.models import Lesson, LessonCompletion
        
        User = get_user_model()
        
        try:
            # Check if course exists
            try:
                course = Course.objects.get(id=course_id)
            except Course.DoesNotExist:
                return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # Check if student exists
            try:
                student = User.objects.get(id=student_id)
            except User.DoesNotExist:
                return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # Check if user is a teacher for this course
            if request.user.role != "teacher":
                return Response(
                    {"error": "Only teachers can view student progress"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            is_course_teacher = CourseEnrollment.objects.filter(
                user=request.user,
                course=course,
                role="teacher",
                status="active"
            ).exists()
            
            if not is_course_teacher:
                return Response(
                    {"error": "Only teachers of this course can view student progress"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Check if the student is enrolled in this course
            is_enrolled = CourseEnrollment.objects.filter(
                user=student,
                course=course,
                role="student"
            ).exists()
            
            if not is_enrolled:
                return Response(
                    {"error": "Student is not enrolled in this course"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Calculate progress
            completed_lessons = LessonCompletion.objects.filter(
                student=student,
                lesson__course=course
            ).select_related('lesson')
            
            completed_credits = sum(
                completion.lesson.credit_value for completion in completed_lessons
            )
            
            total_credits = course.total_credits or 1
            progress_percentage = round((completed_credits / total_credits) * 100, 1)
            
            return Response({
                "student_id": student.id,
                "student_name": f"{student.first_name} {student.last_name}",
                "student_email": student.email,
                "course_id": course.id,
                "course_title": course.title,
                "completed_credits": completed_credits,
                "total_credits": total_credits,
                "progress_percentage": progress_percentage,
                "completed_lessons_count": completed_lessons.count(),
                "total_lessons_count": Lesson.objects.filter(course=course).count()
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            import traceback
            print(f"Error in StudentCourseProgressView: {str(e)}")
            print(traceback.format_exc())
            return Response(
                {"error": f"Internal server error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



#adding this class to give information about course completion average for the report generation
class CourseCompletionAverageReportView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsTeacherOrAdmin]

    def get(self, request, course_id):
        course = get_object_or_404(Course, pk=course_id)
        if getattr(request.user, "role", None) == "teacher" and getattr(course, "teacher_id", None) != request.user.id:
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        total_lessons = Lesson.objects.filter(course_id=course.id).count()
        if total_lessons == 0:
            return Response({
                "course": {"id": course.id, "title": getattr(course, "title", "")},
                "metrics": {"average_completion_percent": 0.0, "students_count": 0, "total_lessons": 0}
            }, status=status.HTTP_200_OK)

        student_ids = list(
            LessonCompletion.objects.filter(lesson__course_id=course.id)
            .values_list("student_id", flat=True).distinct()
        )
        students_count = len(student_ids)
        if students_count == 0:
            return Response({
                "course": {"id": course.id, "title": getattr(course, "title", "")},
                "metrics": {"average_completion_percent": 0.0, "students_count": 0, "total_lessons": total_lessons}
            }, status=status.HTTP_200_OK)

        # LessonCompletion existence means it's completed
        completed_total = LessonCompletion.objects.filter(
            lesson__course_id=course.id, student_id__in=student_ids
        ).count()

        avg_completion = round((completed_total / (total_lessons * students_count)) * 100, 2)

        return Response({
            "course": {"id": course.id, "title": getattr(course, "title", "")},
            "metrics": {
                "average_completion_percent": avg_completion,
                "students_count": students_count,
                "total_lessons": total_lessons
            }
        }, status=status.HTTP_200_OK)




#creating class for the average grade
class CourseAverageGradeReportView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsTeacherOrAdmin]

    def get(self, request, course_id):
        course = get_object_or_404(Course, pk=course_id)
        if getattr(request.user, "role", None) == "teacher" and getattr(course, "teacher_id", None) != request.user.id:
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        # Since LessonCompletion doesn't have a grade field, return None for now
        # This can be implemented later when grade functionality is added
        avg_grade = None

        return Response({
            "course": {"id": course.id, "title": getattr(course, "title", "")},
            "metrics": {"average_grade": avg_grade}
        }, status=status.HTTP_200_OK)
