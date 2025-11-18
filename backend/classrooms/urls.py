from django.urls import path
from . import views

urlpatterns = [
    # API Root
    path('', views.ClassroomApiRoot.as_view(), name='classroom-api-root'),
    
    # Teacher URLs
    path('teacher/classrooms/', views.TeacherClassroomListView.as_view(), name='teacher-classrooms-list'),
    path('teacher/classrooms/create/', views.TeacherClassroomCreateView.as_view(), name='teacher-classroom-create'),
    path('teacher/classrooms/<int:classroom_id>/', views.TeacherClassroomDetailView.as_view(), name='teacher-classroom-detail'),
    path('teacher/classrooms/<int:classroom_id>/edit/', views.TeacherClassroomEditView.as_view(), name='teacher-classroom-edit'),
    path('teacher/classrooms/<int:classroom_id>/allocate/', views.TeacherAllocateView.as_view(), name='teacher-classroom-allocate'),
    path('teacher/classrooms/<int:classroom_id>/waitlist/', views.TeacherClassroomWaitlistView.as_view(), name='teacher-classroom-waitlist'),
    path('teacher/all-waitlists/', views.TeacherAllWaitlistsView.as_view(), name='teacher-all-waitlists'),
    
    # Student URLs
    path('student/classrooms/available/', views.StudentAvailableClassroomsView.as_view(), name='student-classrooms-available'),
    path('student/classrooms/', views.StudentMyClassroomsListView.as_view(), name='student-classrooms-list'),
    path('student/classrooms/<int:classroom_id>/', views.StudentClassroomDetailView.as_view(), name='student-classroom-detail'),
    path('student/classrooms/<int:classroom_id>/enroll/', views.StudentEnrollView.as_view(), name='student-classroom-enroll'),
    path('student/classrooms/<int:classroom_id>/unenroll/', views.StudentUnenrollView.as_view(), name='student-classroom-unenroll'),
    path('student/classrooms/<int:classroom_id>/join-waitlist/', views.StudentJoinWaitlistView.as_view(), name='student-join-waitlist'),
    path('student/classrooms/<int:classroom_id>/leave-waitlist/', views.StudentLeaveWaitlistView.as_view(), name='student-leave-waitlist'),
    path('student/classrooms/<int:classroom_id>/enrollment-status/', views.StudentEnrollmentStatusView.as_view(), name='student-enrollment-status'),
    path('student/my-waitlists/', views.StudentMyWaitlistsView.as_view(), name='student-my-waitlists'),
]
