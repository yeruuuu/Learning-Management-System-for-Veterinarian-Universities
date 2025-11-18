from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Lesson(models.Model):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("published", "Published"),
        ("archived", "Archived"),
    ]

    LESSON_DURATION_CHOICES = [
        ("1_hour", "1 Hour"),
        ("2_hours", "2 Hours"),
        ("3_hours", "3 Hours"),
    ]
    
    id = models.AutoField(primary_key=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="lessons")
    title = models.CharField(max_length=200)
    description = models.TextField()
    objectives = models.TextField(blank=True)
    credit_value = models.FloatField(default=0.0)
    estimated_duration = models.CharField(max_length=10, choices=LESSON_DURATION_CHOICES, default="1_hour")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="draft")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resources = models.TextField(blank=True, help_text="Links for reading lists (comma separated)")
    additional_notes = models.TextField(blank=True)
    course = models.ForeignKey("courses.Course", related_name="lessons", on_delete=models.CASCADE)
    prerequisites = models.ManyToManyField("self", symmetrical=False, blank=True)

    def prerequisites_completed_by(self, user):
        completed_ids = set(
            LessonCompletion.objects.filter(student=user).values_list('lesson_id', flat=True)
        )
        for prereq in self.prerequisites.all():
            if prereq.id not in completed_ids:
                return False
        return True

    def is_public(self):
        return self.status == "published"

    def __str__(self):
        return f"{self.title} ({self.status})"


    class Meta:
            ordering = ["course", "id"]

    def __str__(self):
        return f"{self.user} as {self.role} in return {self.title} ({self.course.name})"
    
    def is_public(self):
        return self.status == "published"
    
    def archive(self):
        self.status = "archived"
        self.save(update_fields=["status", "updated_at"])

class LessonCompletion(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="lesson_completions"
    )
    lesson = models.ForeignKey(
        "Lesson",
        on_delete=models.CASCADE,
        related_name="completions"
    )
    completed_at = models.DateTimeField(auto_now_add=True)
    GRADE_CHOICES = [
        ("HD", "High Distinction"),
        ("D", "Distinction"),
        ("C", "Credit"),
        ("P", "Pass"),
        ("F", "Fail"),
    ]
    grade = models.CharField(max_length=2, choices=GRADE_CHOICES, null=True, blank=True)
    graded_at = models.DateTimeField(null=True, blank=True)
    comment = models.TextField(blank=True)

    class Meta:
        unique_together = ("student", "lesson")
