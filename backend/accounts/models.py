from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager



#this is to have the base users 
class UserHandler(BaseUserManager):  
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.username = email
        user.set_password(password)
        user.save(using=self._db)   #will store the user to the database
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True) # this is setting the is active meaning the someone can still use the account

    
        
        
        #having some test checks to make sure the superuser has correct rights        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff =True.') 
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.') 
        

        user = self.create_user(email, password, **extra_fields)
        user.username = email
        user.is_staff = True
        user.is_superuser = True  #making them the super user
        user.save(using=self._db)   #making the user

        return user



#I acknowledge the use of CoPilot (integrated into VScode) to help with minor debugging of the code and the syntax of django for below. Prompts mainly included the bug/issue I was facing.
# The output and syntax was  well understood by me was then modified further suit the needs of this project.
class User(AbstractUser):
    email = models.EmailField(unique=True)

    avatar = models.ImageField(
        upload_to="avatars/",
        default="defaults/avatar.png",   # relative to MEDIA_ROOT
        blank=True,
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ["first_name", "last_name"]  # will be asking email

    ROLE_CHOICES = (
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    is_approved = models.BooleanField(default=False)  # Might need to change this


    is_active = models.BooleanField(default=True)  # can login or not
    is_staff = models.BooleanField(default=False)  
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)


    objects = UserHandler()  #this line uses the custom user manager to handle user creation and management
    

    class Meta:
        db_table = "users"  #connecting to the users db
        
    def save(self, *args, **kwargs):

        if self.is_active is None:
            self.is_active = True   #this is to handle the edge cases
          
        if self.role in ['student','admin']:
            self.is_approved = True  # Students and admin dont need approval for sign in 
            
        elif self.is_approved is None and self.role == 'teacher':
            self.is_approved = True  # Instructors need approval for sign in
        super().save(*args, **kwargs)   

    def __str__(self):
        return f"Username:{self.username} \nRole:{self.role}\nEmail:{self.email}"
    



