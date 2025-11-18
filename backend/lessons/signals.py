from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Lesson


@receiver(post_save, sender=Lesson)
@receiver(post_delete, sender=Lesson)
def update_course_status_on_lesson_change(sender, instance, **kwargs):
    """
    Automatically update course status to 'published' when:
    1. Lesson credits equal or exceed the course's total_credits capacity
    2. All lessons in the course have 'published' status
    """
    course = instance.course
    
    # Skip if course has no credit limit set
    if course.total_credits <= 0:
        return
    
    # Calculate sum of all lesson credits
    lesson_credits_sum = course.calculate_total_credits()
    
    # Check if all lessons are published
    all_lessons = course.lessons.all()
    all_lessons_published = all_lessons.exists() and all(
        lesson.status == "published" for lesson in all_lessons
    )
    
    # Auto-publish course if:
    # - Credits are met
    # - All lessons are published
    # - Course is currently in draft
    if (course.status == "draft" and 
        lesson_credits_sum >= course.total_credits and 
        all_lessons_published):
        course.status = "published"
        course.save(update_fields=["status", "updated_at"])
    
    # Revert to draft if:
    # - Credits fall below requirement, OR
    # - Any lesson is not published
    elif (course.status == "published" and 
          (lesson_credits_sum < course.total_credits or not all_lessons_published)):
        course.status = "draft"
        course.save(update_fields=["status", "updated_at"])
