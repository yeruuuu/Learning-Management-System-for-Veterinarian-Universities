from rest_framework import serializers
from .models import Course, CourseEnrollment
from lessons.serializers import LessonSerializer


class CourseSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    progress_percentage = serializers.SerializerMethodField()
    completed_credits = serializers.SerializerMethodField()

    def get_completed_credits(self, obj):
        """Calculate credits from completed lessons for the current user"""
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return 0
        
        from lessons.models import LessonCompletion
        completed_lesson_ids = LessonCompletion.objects.filter(
            student=request.user,
            lesson__course=obj
        ).values_list('lesson_id', flat=True)
        
        completed_credits = sum(
            lesson.credit_value for lesson in obj.lessons.all() 
            if lesson.id in completed_lesson_ids
        )
        return completed_credits

    def get_progress_percentage(self, obj):
        """Calculate progress percentage based on completed credits"""
        if obj.total_credits <= 0:
            return 0
        
        completed_credits = self.get_completed_credits(obj)
        return round((completed_credits / obj.total_credits) * 100, 1)

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "description",
            "total_credits",
            "completed_credits",
            "progress_percentage",
            "duration",
            "status",
       #     "author", -  need to check if this need to be brought back
            "created_at",
            "updated_at",
            "lessons",
           # "classrooms", -- need to include this later
        ]

        #adding this because these fields are only meant to be read only
        extra_kwargs = {
            "author": {"read_only": True},
            "created_at": {"read_only": True}, 
            "updated_at": {"read_only": True},   
            "id": {"read_only": True},            
        }


    #making the create method to have the teacher
    def create(self, validated_data):
        request = self.context.get("request")
        user = request.user  #this is tp get the user
        course = Course.objects.create(teacher=user, **validated_data)
        return course


class CourseEnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseEnrollment
        course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all()) # added this so it wont be treated just as PK
        fields = ["id", "user", "course", "role", "status", "enrolled_at"]
        extra_kwargs = {
            "user": {"read_only": True},
            "enrolled_at": {"read_only": True},
            "status": {"read_only": True}, 
            "role": {"read_only": True},    
        }
