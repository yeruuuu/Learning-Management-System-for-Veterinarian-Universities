#this is for the urls for the accounts

from django.urls import path
from .views import TokenPairView, UniversityAverageGradeReportView
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegistrationView, seeUserListView, approveTeacherView, 
    deactiveStudentAccountView, TeachersListView, StudentsListView,
    BanTeacherView, UnbanTeacherView, UnbanStudentAccountView,
    MeView, ChangePasswordView, UserEnrolledCoursesView, UserTeachingCoursesView,
    UniversityCountsReportView)


urlpatterns = [
    path('login/', TokenPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegistrationView.as_view(), name='register'),  #this is where they go when registering
    path('users/', seeUserListView.as_view(), name='user-list'),  #this is for the admin to view the list of users
    path('teachers/', TeachersListView.as_view(), name='teacher-list'), # this is to get the list of teachers
    path('students/', StudentsListView.as_view(), name='student-list'), # this is to get the list of students
    path('approve-teacher/<int:id>/', approveTeacherView.as_view(), name='approve-teacher'),  #to approve a teacher
    path('deactivate-student/<str:email>/', deactiveStudentAccountView.as_view(), name='deactivate-student'), #to deactivate a student account
    path('ban-teacher/<int:id>/', BanTeacherView.as_view(), name='ban-teacher'),
    path('unban-teacher/<int:id>/', UnbanTeacherView.as_view(), name='unban-teacher'),
    path('unban-student/<str:email>/', UnbanStudentAccountView.as_view(), name='unban-student'),    
    path('me/', MeView.as_view(), name='me'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('users/<int:user_id>/courses/', UserEnrolledCoursesView.as_view(), name='user-enrolled-courses'),
    path('users/<int:user_id>/teaching/', UserTeachingCoursesView.as_view(), name='user-teaching-courses'),
    path("reports/university/counts/", UniversityCountsReportView.as_view(), name="report-university-counts"),
    path("reports/university/average-grade/", UniversityAverageGradeReportView.as_view(), name="report-university-average-grade"),

]




