from rest_framework import serializers
from .models import Lesson, LessonCompletion
from django.contrib.auth import get_user_model
User = get_user_model()
from courses.models import CourseEnrollment


class LessonSerializer(serializers.ModelSerializer):
    accessible = serializers.SerializerMethodField()
    is_completed = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = [
            "id",
            "title",
            "description",
            "objectives",
            "additional_notes",
            "credit_value",
            "estimated_duration",
            "status",
            "author",
            "created_at",
            "updated_at",
            "resources",
            "course",
            "prerequisites",
            "accessible",
            "is_completed",
        ]
        extra_kwargs = {
            "author": {"read_only": True},
            "course": {"read_only": True},
            "created_at": {"read_only": True},
            "updated_at": {"read_only": True},
            "id": {"read_only": True},
        }

    def get_accessible(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        # Teachers have access if they are course teacher or enrolled as teacher
        if user and getattr(user, "role", None) == "teacher":
            if obj.course.teacher_id == user.id:
                return True
            return CourseEnrollment.objects.filter(
                user=user, course=obj.course, role="teacher", status="active"
            ).exists()
        # Students: accessible only when published and prerequisites satisfied
        if obj.status != "published":
            return False
        return obj.prerequisites_completed_by(user)

    def get_is_completed(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not user or getattr(user, "role", None) != "student":
            return False
        return LessonCompletion.objects.filter(student=user, lesson=obj).exists()


class LessonCompletionSerializer(serializers.ModelSerializer):
    student_id = serializers.IntegerField(source="student.id", read_only=True)
    student_name = serializers.SerializerMethodField()
    student_email = serializers.EmailField(source="student.email", read_only=True)

    class Meta:
        model = LessonCompletion
        fields = ["student_id", "student_name", "student_email", "grade", "comment", "completed_at", "graded_at"]

    def get_student_name(self, obj):
        first = getattr(obj.student, "first_name", "") or ""
        last = getattr(obj.student, "last_name", "") or ""
        full = f"{first} {last}".strip()
        return full or obj.student.email


class StudentGradeSerializer(serializers.ModelSerializer):
    lesson_id = serializers.IntegerField(source="lesson.id", read_only=True)
    lesson_title = serializers.CharField(source="lesson.title", read_only=True)
    course_id = serializers.IntegerField(source="lesson.course.id", read_only=True)
    course_title = serializers.CharField(source="lesson.course.title", read_only=True)
    status = serializers.SerializerMethodField()

    class Meta:
        model = LessonCompletion
        fields = [
            "lesson_id",
            "lesson_title",
            "course_id",
            "course_title",
            "grade",
            "comment",
            "completed_at",
            "graded_at",
            "status",
        ]

    def get_status(self, obj):
        return "Marked" if obj.grade else "Pending"
