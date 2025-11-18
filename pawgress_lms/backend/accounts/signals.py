#this file is used for managing the singals for the accounts and in the app
from django.contrib.auth import get_user_model
from django.db.models.signals import post_migrate, post_save
from django.dispatch import receiver


User = get_user_model()

@receiver(post_migrate)
def create_default_admin_account(sender, **kwargs):
    if sender.name == 'accounts':
        admin_email = "admin@cookieuniversity.edu"
        admin_password = "password"
        admin_role = "admin"
        admin_is_approved = True
        admin_first_name = "Admin"
        admin_last_name = "University"
        admin_date_of_birth = "1999-11-18"


         
         # Create the admin user if it doesn't exist
         #checking with the admin email
        if not User.objects.filter(email = admin_email).exists():
            User.objects.create_superuser(
                                          email = admin_email ,

                                          password= admin_password,
                                          first_name= admin_first_name,
                                            last_name= admin_last_name,
                                            date_of_birth= admin_date_of_birth,

                                            role=admin_role,
                                            is_approved=admin_is_approved
        )
        
            print("An admin account has been created: \nUsername: admin \nPassword: password")


@receiver(post_save, sender=User)
def update_course_enrollments_on_user_status_change(sender, instance, created, update_fields, **kwargs):
    """
    When a user's is_active status changes (e.g., banned), update all their course enrollments.
    - If user is banned (is_active=False), set enrollment status to 'banned'
    - If user is reactivated (is_active=True), set enrollment status back to 'active'
    """
    if not created:  # Only run for updates, not new user creation
        from courses.models import CourseEnrollment
        
        # Check if is_active field was updated
        if update_fields is None or 'is_active' in update_fields:
            enrollments = CourseEnrollment.objects.filter(user=instance)
            
            if instance.is_active:
                # User was reactivated - set student enrollments back to active (preserve teacher status)
                enrollments.filter(role='student', status='banned').update(status='active')
            else:
                # User was banned - set all active enrollments to banned
                enrollments.filter(status='active').update(status='banned')
