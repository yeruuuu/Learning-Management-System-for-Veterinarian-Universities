#this is for the urls for the courses

from django.urls import path, include

from .views import (
    CourseListView,
    AvailableCoursesView,
    CourseCreateView,
    CourseDetailView,
    CourseCompletionAverageReportView,
    CourseAverageGradeReportView,
    CourseArchiveView,
    CourseRepublishView,
    CourseEnrollmentCreateView,
    CourseStudentsView,
    ArchivedCoursesView,
    CourseEnrollmentArchiveView,
    CourseWithdrawView,
    StudentCourseProgressView,
)


urlpatterns = [
    path("", CourseListView.as_view(), name="course-list"),  # this is just to view the courses
    path("archived/", ArchivedCoursesView.as_view(), name="archived-courses"),
    path("available/", AvailableCoursesView.as_view(), name="available-courses"),
    path("create/", CourseCreateView.as_view(), name="course-create"),
    path("<int:pk>/", CourseDetailView.as_view(), name="course-detail"),
    path("<int:pk>/archive/", CourseArchiveView.as_view(), name="course-archive"),
    path("<int:pk>/republish/", CourseRepublishView.as_view(), name="course-republish"),
    path("enrollments/create/", CourseEnrollmentCreateView.as_view(), name="course-enrollment-create"),
    path("<int:pk>/students/", CourseStudentsView.as_view(), name="course-students"),
    path("<int:course_id>/students/<int:student_id>/progress/", StudentCourseProgressView.as_view(), name="student-course-progress"),
    path("<int:course_id>/enrollment/archive/", CourseEnrollmentArchiveView.as_view(), name="course-enrollment-archive"),
    path("<int:course_id>/withdraw/", CourseWithdrawView.as_view(), name="course-withdraw"),
    path('lessons/', include('lessons.urls')),
    path("reports/course/<int:course_id>/completion/", CourseCompletionAverageReportView.as_view(), name="report-course-completion"),
    path("reports/course/<int:course_id>/average-grade/", CourseAverageGradeReportView.as_view(), name="report-course-average-grade"),
]   