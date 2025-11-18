from django.urls import path
from .views import (
    LessonListView,
    LessonCreateView,
    LessonDetailView,
    LessonStatusUpdateView,
    LessonCompletionView,
    LessonCompletedStudentsView,
    LessonGradeView,
    MyLessonCompletionsView,
    StudentCourseCompletionsView,
    CourseGPAView,
)


urlpatterns = [
    path('<int:course_id>/', LessonListView.as_view(), name='lesson-list'),
    path('<int:course_id>/create/', LessonCreateView.as_view(), name='lesson-create'),
    path('<int:course_id>/<int:pk>/', LessonDetailView.as_view(), name='lesson-detail'),
    path('<int:course_id>/<int:pk>/status/', LessonStatusUpdateView.as_view(), name='lesson-status-update'),
    path('<int:course_id>/<int:pk>/complete/', LessonCompletionView.as_view(), name='lesson-completion'),
    path('<int:course_id>/<int:pk>/completed/', LessonCompletedStudentsView.as_view(), name='lesson-completed-students'),
    path('<int:course_id>/<int:pk>/grade/', LessonGradeView.as_view(), name='lesson-grade'),
    path('my/completions/', MyLessonCompletionsView.as_view(), name='my-lesson-completions'),
    path('course/<int:course_id>/student/<int:student_id>/completions/', StudentCourseCompletionsView.as_view(), name='student-course-completions'),
    path('course/<int:course_id>/gpa/', CourseGPAView.as_view(), name='course-gpa'),
]
