from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Course(models.Model):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("published", "Published"),
        ("archived", "Archived"),
    ]
    
    DURATION_CHOICES = [
        ("2_weeks", "2 Weeks"),
        ("3_weeks", "3 Weeks"), 
        ("4_weeks", "4 Weeks"),
    ]
    
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name="courses")
    title = models.CharField(max_length=200)
    description = models.TextField()
    total_credits = models.FloatField(default=0.0)
    duration = models.CharField(max_length=10, choices=DURATION_CHOICES, default="4_weeks")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="draft")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def calculate_total_credits(self):
        """Calculate total credits from all lessons in the course"""
        from django.db.models import Sum
        total = self.lessons.aggregate(Sum('credit_value'))['credit_value__sum']
        return total or 0

    def is_public(self):
        return self.status == "published"

    def __str__(self):
        return f"{self.title} ({self.status})"

    def can_publish(self):
        from django.db.models import Sum
        published_credits = self.lessons.filter(status="published").aggregate(
            Sum("credit_value")
        )["credit_value__sum"] or 0.0
        target = float(self.total_credits or 0.0)
        # Allow minor floating point tolerance
        return abs(float(published_credits) - target) < 1e-6



#this is to be used with the enrollment of the teachers and the students 
class CourseEnrollment(models.Model):
    ROLE_CHOICES = [
        ("student", "Student"),
        ("teacher", "Teacher"),
    ]
    
    STATUS_CHOICES = [
        ("active", "Active"),
        ("completed", "Completed"),
        ("withdrawn", "Withdrawn"),
        ("archived", "Archived"),
        ("banned", "Banned"),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="course_enrollments")
    course = models.ForeignKey('Course', on_delete=models.CASCADE, related_name="enrollments")
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="active")
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "course", "role")  # User can be both student and teacher in same course

    def __str__(self):
        return f"{self.user} as {self.role} in {self.course}"
    
    def is_public(self):
        return self.status == "published"
    
    def archive(self):
        self.status = "archived"
        self.save(update_fields=["status", "updated_at"])

