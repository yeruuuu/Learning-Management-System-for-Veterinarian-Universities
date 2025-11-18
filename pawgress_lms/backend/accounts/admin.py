from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User



class UserAdminTeacherApproval(UserAdmin):

    #info for the user
    list_display = ('email', 'first_name', 'last_name', 'role', 'is_approved', 'is_staff')
    
    # this is to filter options
    list_filter = ('role', 'is_approved', 'is_staff', 'is_superuser')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'date_of_birth')}),
        ('Permissions', {'fields': ('role', 'is_approved', 'is_staff', 'is_active')}),
    )

    list_editable = ('is_approved','is_staff',)  #this is to  change the tick box , to approve teachers,and to change if someone is staff or not
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'date_of_birth', 'role', 'is_approved', 'password1', 'password2', 'is_staff', 'is_active'),
        }),
    )



admin.site.register(User, UserAdminTeacherApproval)