from django.shortcuts import render
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db.models import Avg
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsTeacherOrAdmin

from rest_framework import permissions, status
from lessons.models import LessonCompletion
from .models import User
from rest_framework import status
from rest_framework.response import Response
from .serializers import UserSerializer
from .serializers import RegistrationSerializer, ModifiedObtainPairSerializer
from .serializers import AccountMeSerializer, ChangePasswordSerializer
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from django.contrib.auth import get_user_model


User = get_user_model()


class RegistrationView(generics.CreateAPIView):

    #this is to get who can all have permission to register
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegistrationSerializer

    #adding this for debugging, just do show which part is failing , might remove later
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print(serializer.errors)  # this will just print to the terminal which part is faulty, might remove later
        return super().create(request, *args, **kwargs)


#geting token
class TokenPairView(TokenObtainPairView):
    serializer_class = ModifiedObtainPairSerializer


#this is to see all the users,  this will be for the admin 
class seeUserListView(generics.ListAPIView):
    queryset = User.objects.filter(is_active=True)
    permission_classes = [permissions.IsAdminUser]
    serializer_class = UserSerializer

class approveTeacherView(generics.UpdateAPIView):
    #this is to just get the teachers only 
    queryset = User.objects.filter(role='teacher')
    
    permission_classes = [permissions.IsAdminUser]
    serializer_class = UserSerializer
    lookup_field = 'id'  # need to check if we will use email or id for looking up

    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        user.is_approved = True
        user.save()

        #just returning that the teacher got approved and just sending the ok code
        return Response(f"Teacher {user.first_name} {user.last_name} (Email: {user.email}) approved successfully\n{status.HTTP_200_OK}") 


    #-- will uncomment this if we need to filter just the teachers that are not approved yet --
    #this is to see all the teachers who are not approved yet
    def get_queryset(self):
        return User.objects.filter(role='teacher', is_approved=False)
    

class TeachersListView(generics.ListAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = UserSerializer

    def get_queryset(self):
        status = self.request.query_params.get('status', 'pending')
        if status == 'pending':
            return User.objects.filter(role='teacher', is_approved=False, is_active=True)
        elif status == 'approved':
            return User.objects.filter(role='teacher', is_approved=True, is_active=True)
        elif status == 'banned':
            return User.objects.filter(role='teacher', is_active=False)
        return User.objects.none()



class StudentsListView(generics.ListAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = UserSerializer

    def get_queryset(self):
        status = self.request.query_params.get('status', 'active')
        if status == 'active':
            return User.objects.filter(role='student', is_active=True)
        elif status == 'banned':
            return User.objects.filter(role='student', is_active=False)
        return User.objects.none()
class UnbanStudentAccountView(generics.UpdateAPIView):
    queryset = User.objects.filter(role='student', is_active=False)
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'email'

    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        user.is_active = True
        user.save()
        return Response(f"Student {user.first_name} {user.last_name} (Email: {user.email}) has been unbanned successfully", status=status.HTTP_200_OK)

class deactiveStudentAccountView(generics.UpdateAPIView):
    #just getting the students only
    queryset = User.objects.filter(role='student', is_active=True)
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'email'  #will be searching the students based off their email

    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        user.is_active = False
        user.save()
        print(f"DEBUG: {user.email} is_active={user.is_active}")  # Add this line

        #just returning that the student got deactivated and just sending the ok code
        return Response(f"Student -  {user.first_name} {user.last_name} (Email: {user.email}) has been deactivated successfully\n{status.HTTP_200_OK}") 

class BanTeacherView(generics.UpdateAPIView):
    queryset = User.objects.filter(role='teacher', is_active=True)
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'id'

    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        user.is_active = False
        user.save()

        return Response(f"Teacher {user.first_name} {user.last_name} has been banned successfully", status=status.HTTP_200_OK)

class UnbanTeacherView(generics.UpdateAPIView):
    queryset = User.objects.filter(role='teacher', is_active=False)
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'id'

    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        user.is_active = True
        user.save()

        return Response(f"Teacher {user.first_name} {user.last_name} has been unbanned successfully", status=status.HTTP_200_OK)
  


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = AccountMeSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.GenericAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        old_password = serializer.validated_data['old_password']
        new_password = serializer.validated_data['new_password']

        if not user.check_password(old_password):
            return Response({"old_password": ["Incorrect password"]}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"detail": "Password changed successfully"}, status=status.HTTP_200_OK)


class UserEnrolledCoursesView(generics.GenericAPIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, user_id, *args, **kwargs):
        from courses.models import CourseEnrollment
        from courses.serializers import CourseSerializer
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Get all active course enrollments for this user as a student
        enrollments = CourseEnrollment.objects.filter(
            user=user, 
            role="student", 
            status="active"
        ).select_related('course')
        
        # Get the courses
        courses = [enrollment.course for enrollment in enrollments]
        
        # Serialize the courses with context
        serializer = CourseSerializer(courses, many=True, context={'request': request})
        
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserTeachingCoursesView(generics.GenericAPIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, user_id, *args, **kwargs):
        from courses.models import Course
        from courses.serializers import CourseSerializer
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if user is a teacher
        if user.role != "teacher":
            return Response({"error": "User is not a teacher"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get all courses where this user is the teacher
        courses = Course.objects.filter(teacher=user).exclude(status="archived")
        
        # Serialize the courses with context
        serializer = CourseSerializer(courses, many=True, context={'request': request})
        
        return Response(serializer.data, status=status.HTTP_200_OK)

#this class gives the number of students and teachers in the university
class UniversityCountsReportView(APIView):
    permission_classes = [IsAuthenticated, IsTeacherOrAdmin]

    def get(self, request):
        students = User.objects.filter(role="student").count()
        teachers = User.objects.filter(role="teacher").count()
        return Response({"students_count": students, "teachers_count": teachers}, status=status.HTTP_200_OK)



#this class is for avg grade of all students in the university
class UniversityAverageGradeReportView(APIView):
    permission_classes = [IsAuthenticated, IsTeacherOrAdmin]

    def get(self, request):
        # Since LessonCompletion doesn't have a grade field, return None for now
        # This can be implemented later when grade functionality is added
        avg_grade = None
        return Response({"average_grade": avg_grade}, status=status.HTTP_200_OK)
