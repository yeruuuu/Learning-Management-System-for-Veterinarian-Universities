"""
One-time script to update course enrollment status for users who are already banned
Run this with: python update_banned_users.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pawgress_lms.settings')
django.setup()

from django.contrib.auth import get_user_model
from courses.models import CourseEnrollment

User = get_user_model()

# Find all users who are inactive (banned)
banned_users = User.objects.filter(is_active=False)

print(f"Found {banned_users.count()} banned users")

for user in banned_users:
    # Update their course enrollments to banned status
    updated = CourseEnrollment.objects.filter(
        user=user,
        status='active'
    ).update(status='banned')
    
    if updated > 0:
        print(f"Updated {updated} enrollments for {user.email} to 'banned' status")

print("Done!")
