from django.contrib.auth import get_user_model
from rest_framework import serializers
from lessons.serializers import LessonSerializer
from .models import Classroom, Enrollment
from courses.models import Course, CourseEnrollment
import datetime

User = get_user_model()

class PublicUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "full_name"]

    def get_full_name(self, user_name):
        name = f"{user_name.first_name} {user_name.last_name}".strip()
        return name or str(user_name)

def _context_user(request, context):
    userID = context.get("user_id")
    if userID:
        try:
            return User.objects.get(pk=userID)
        except User.DoesNotExist:
            return None
    else: 
        user = getattr(request, "user", None)
        if getattr(user, "is_authenticated", False):
            return None 
    
def _is_student(user) -> bool:
    return bool(user) and getattr(user, "role", None) == "student"

class StudentClassroomListSerializer(serializers.ModelSerializer):
    course = serializers.StringRelatedField()
    course_id = serializers.IntegerField(source="course.id", read_only=True)
    teacher = PublicUserSerializer(read_only=True)
    occupancy = serializers.IntegerField(read_only=True, source="occupancy_count")
    has_space = serializers.BooleanField(read_only=True, source="has_space_flag")
    is_enrolled = serializers.SerializerMethodField()

    class Meta:
        model = Classroom
        fields = [
            "id",
            "title",
            "description",
            "course",
            "course_id",
            "lessons",
            "teacher",
            "status",
            "class_start_date",
            "class_start_time",
            "class_end_date",
            "class_end_time",
            "frequency",
            "duration_weeks",
            "location",
            "capacity",
            "occupancy",
            "has_space",
            "is_enrolled",
        ]

    def get_is_enrolled(self, obj):
        request = self.context.get("request")
        user = _context_user(request, self.context)
        if not _is_student(user):
            return False
        return Enrollment.objects.filter(
            student_id=user.id,
            classroom_id=obj.id,
            status=Enrollment.STATUS_ENROLLED,
        ).exists()

class StudentClassroomDetailSerializer(StudentClassroomListSerializer):
    lesson_details = LessonSerializer(source="lessons", many=True, read_only=True)

    class Meta(StudentClassroomListSerializer.Meta):
        fields = StudentClassroomListSerializer.Meta.fields + ["lesson_details"]

class TeacherClassroomListSerializer(serializers.ModelSerializer):
    course = serializers.StringRelatedField()
    enrolled_count = serializers.IntegerField(read_only=True)
    has_space = serializers.BooleanField(read_only=True)

    class Meta:
        model = Classroom
        fields = [
            "id",
            "title",
            "description",
            "course",
            "status",
            "class_start_date",
            "class_end_date",
            "class_start_time",
            "class_end_time",
            "frequency",
            "duration_weeks",
            "location",
            "capacity",
            "enrolled_count",
            "has_space",
        ]

class TeacherClassroomDetailSerializer(TeacherClassroomListSerializer):
    lesson_details = LessonSerializer(source="lessons", many=True, read_only=True)
    enrolled_students = serializers.SerializerMethodField()
    teacher_name = serializers.SerializerMethodField(read_only=True)

    class Meta(TeacherClassroomListSerializer.Meta):
        fields = TeacherClassroomListSerializer.Meta.fields + ["lesson_details", "enrolled_students", "teacher_name"]

    def get_enrolled_students(self, obj):
        queryset = (Enrollment.objects.filter(classroom=obj, status=Enrollment.STATUS_ENROLLED).select_related("student").only("student__id", "student__first_name", "student__last_name"))
        out = []
        for enrolled in queryset:
            student = enrolled.student
            full_name = f"{student.first_name} {student.last_name}".strip() or str(student)
            out.append({
                "id": student.id,
                "first_name": student.first_name,
                "last_name": student.last_name,
                "full_name": full_name,
            })
        return out

    def get_teacher_name(self, obj):
        teacher = getattr(obj, "teacher", None)
        if not teacher:
            return None
        full = getattr(teacher, "get_full_name", None)
        if callable(full):
            name = teacher.get_full_name()
            if name:
                return name
        return getattr(teacher, "username", getattr(teacher, "email", None))

class ClassroomCreateSerializer(serializers.ModelSerializer):
    start_date = serializers.DateField(source="class_start_date")
    end_date = serializers.DateField(source="class_end_date")
    frequency = serializers.IntegerField(min_value=1, required=False)
    duration_weeks = serializers.IntegerField(min_value=2, max_value=4, required=False)

    class Meta:
        model = Classroom
        fields = [
            "title",
            "description",
            "start_date",
            "end_date",
            "location",
            "capacity",
            "course",
            "frequency",
            "duration_weeks",
        ]
        extra_kwargs = {
            "course": {"required": False, "allow_null": True},
        }

    def validate_capacity(self, value):
        if value is not None and value > 20:
            raise serializers.ValidationError("Capacity cannot exceed 20.")
        return value

    def validate(self, attrs):
        if not attrs.get("title"):
            name_alias = self.initial_data.get("name") or self.initial_data.get("classroom_name")
            if name_alias:
                attrs["title"] = name_alias

        if not attrs.get("description"):
            desc_alias = (
                self.initial_data.get("description")
                or self.initial_data.get("desc")
                or self.initial_data.get("short_description")
            )
            if desc_alias:
                attrs["description"] = desc_alias

        if not attrs.get("capacity"):
            seats = self.initial_data.get("seats") or self.initial_data.get("max_capacity")
            if seats:
                attrs["capacity"] = seats

        start = attrs.get("class_start_date")
        end = attrs.get("class_end_date")
        if start and end and end < start:
            raise serializers.ValidationError({"end_date": "End date must be on or after start date."})
        if "duration_weeks" in attrs:
            dw = attrs["duration_weeks"]
            if dw < 2 or dw > 4:
                raise serializers.ValidationError({"duration_weeks": "Duration must be between 2 and 4 weeks."})
        return attrs

    def create(self, validated_data):
  
        validated_data.setdefault("class_start_time", "09:00:00")
        validated_data.setdefault("class_end_time", "17:00:00")
        validated_data.setdefault("frequency", validated_data.get("frequency", 1))
        validated_data.setdefault("duration_weeks", validated_data.get("duration_weeks", 2))
        validated_data.setdefault("status", "scheduled")

        request = self.context.get("request")
        if request and getattr(request, "user", None) and request.user.is_authenticated:
            validated_data["teacher"] = request.user
        return super().create(validated_data)

class ClassroomCreateSerializer(serializers.ModelSerializer):
    class_start_time = serializers.TimeField(required=False, allow_null=True)
    class_end_time = serializers.TimeField(required=False, allow_null=True)
    class_start_date = serializers.DateField(required=False, allow_null=True)
    class_end_date = serializers.DateField(required=False, allow_null=True)
    course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), required=True)
    
    class Meta:
        model = Classroom
        fields = [
            'id', 'title', 'description', 'capacity', 'location', 'frequency',
            'duration_weeks', 'class_start_date', 'class_end_date', 
            'class_start_time', 'class_end_time', 'course'
        ]
        read_only_fields = ['id']

    def validate(self, data):
        print(f"Serializer validate called with data: {data}")
        
        if 'class_start_time' not in data or data.get('class_start_time') is None:
            data['class_start_time'] = datetime.time(9, 0)
            
        if 'class_end_time' not in data or data.get('class_end_time') is None:
            data['class_end_time'] = datetime.time(10, 0)
            
        print(f"Serializer validate returning data: {data}")
        return data

    def validate_course(self, value):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if not user or not getattr(user, 'is_authenticated', False):
            raise serializers.ValidationError("Authentication required")
        if getattr(user, 'role', None) != 'teacher':
            raise serializers.ValidationError("Only teachers can assign a course")
        is_enrolled = CourseEnrollment.objects.filter(
            user=user, course=value, role='teacher', status='active'
        ).exists()
        if not is_enrolled:
            raise serializers.ValidationError("You are not enrolled as a teacher in this course")
        return value

    def create(self, validated_data):
        print(f"Serializer create called with validated_data: {validated_data}")
        
        if 'class_start_time' not in validated_data or validated_data['class_start_time'] is None:
            validated_data['class_start_time'] = datetime.time(9, 0)
        if 'class_end_time' not in validated_data or validated_data['class_end_time'] is None:
            validated_data['class_end_time'] = datetime.time(10, 0)
        
        classroom = Classroom.objects.create(**validated_data)
        print(f"Created classroom: {classroom.id} with start_date: {classroom.class_start_date}, start_time: {classroom.class_start_time}")  # Debug log
        return classroom

    def update(self, instance, validated_data):
        for field in ['title', 'description', 'capacity', 'location', 'frequency', 
                     'duration_weeks', 'class_start_date', 'class_end_date',
                     'class_start_time', 'class_end_time']:
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        instance.save()
        return instance

class TeacherBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name")

class ClassroomSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.username', read_only=True)
    teacher_id = serializers.IntegerField(source='teacher.id', read_only=True)
    enrolled_students_count = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()
    course_id = serializers.IntegerField(source='course.id', read_only=True, allow_null=True)
    
    start_date = serializers.DateField(source='class_start_date', read_only=True)
    end_date = serializers.DateField(source='class_end_date', read_only=True)
    
    class Meta:
        model = Classroom
        fields = [
            'id', 'title', 'description', 'capacity', 'location', 'frequency',
            'duration_weeks', 'class_start_date', 'class_end_date',
            'class_start_time', 'class_end_time', 'teacher_name', 'teacher_id',
            'enrolled_students_count', 'is_enrolled', 'status',
            'start_date', 'end_date', 'course_id'
        ]

    def get_enrolled_students_count(self, obj):
        return obj.enrollments.filter(status=Enrollment.STATUS_ENROLLED).count()

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'student':
            return obj.enrollments.filter(
                student=request.user,
                status=Enrollment.STATUS_ENROLLED
            ).exists()
        return False
    
class EnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    classroom_title = serializers.CharField(source='classroom.title', read_only=True)
    
    class Meta:
        model = Enrollment
        fields = ['id', 'student', 'student_name', 'classroom', 'classroom_title', 'enrolled_at']
        read_only_fields = ['enrolled_at']
