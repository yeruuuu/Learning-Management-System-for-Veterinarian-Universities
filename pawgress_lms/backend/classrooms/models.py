from django.conf import settings
from django.db import models
from django.utils import timezone
from courses.models import Course
from lessons.models import Lesson

User = settings.AUTH_USER_MODEL

class Classroom(models.Model):
    STATUS_CHOICES = [
        ("scheduled", "Scheduled"),
        ("occupied", "Occupied"),
        ("cancelled", "Cancelled"),
    ]

    title = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)

    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="classrooms", null=True, blank=True
    )
    teacher = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name="classrooms")

    class_start_date = models.DateField()
    class_start_time = models.TimeField()
    class_end_date = models.DateField()
    class_end_time = models.TimeField()

    frequency = models.PositiveSmallIntegerField(default=1)
    duration_weeks = models.PositiveSmallIntegerField(default=2)

    location = models.CharField(max_length=150, blank=True)
    capacity = models.PositiveSmallIntegerField(default=20)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="scheduled")

    lessons = models.ManyToManyField(Lesson, blank=True, related_name="classrooms")
    
    class Meta:
        constraints = [
            models.CheckConstraint(check=models.Q(capacity__lte=20), name="capacity_max_20")
        ]
    
    @property
    def occupancy(self):
        return self.enrollments.filter(status=Enrollment.STATUS_ENROLLED).count()

    def __str__(self):
        return f"{self.course.name} – Classroom {self.pk}"


class Enrollment(models.Model):
    STATUS_ENROLLED = 'enrolled'
    STATUS_WAITLISTED = 'waitlisted'
    
    STATUS_CHOICES = [
        (STATUS_ENROLLED, 'Enrolled'),
        (STATUS_WAITLISTED, 'Waitlisted'),
    ]

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='enrollments')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_ENROLLED)
    
    class Meta:
        unique_together = ('student', 'classroom')
    
    def __str__(self):
        return f"{self.student.username} - {self.classroom.title} ({self.status})"


class LessonProgress(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="lesson_progress")
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="progress")
    classroom = models.ForeignKey(Classroom, null=True, blank=True, on_delete=models.SET_NULL)

    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = [("student", "lesson")]

    def __str__(self):
        return f"Progress: {self.student} → {self.lesson} (completed={self.completed})"


class LessonEnrollment(models.Model):
    STATUS_ACTIVE = "active"
    STATUS_DROPPED = "dropped"

    STATUS_CHOICES = [
        (STATUS_ACTIVE, "Active"),
        (STATUS_DROPPED, "Dropped"),
    ]

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="lesson_enrollments")
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="enrollments")
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default=STATUS_ACTIVE)
    enrolled_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = [("student", "lesson")]

    def __str__(self):
        return f"{self.student} in {self.lesson} ({self.status})"


class Waitlist(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('student', 'classroom')
    
    def __str__(self):
        return f"{self.student.username} - {self.classroom.name}"
