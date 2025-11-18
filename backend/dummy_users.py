"""Seed dummy users for local development.

Run via:
  python manage.py shell -c "import dummy_users; dummy_users.main()"
"""
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model

User = get_user_model()

dummy_users = [
    {"first_name": "Abdul Haadhi", "last_name": "Shameen", "email": "asha0277@student.monash.edu",
     "password": "abcdefgh", "role": "student", "date_of_birth": "2000-05-15"},
    {"first_name": "Chi Cheng", "last_name": "Chan", "email": "ccha0249@student.monash.edu",
     "password": "12345678", "role": "student", "date_of_birth": "2001-08-22"},
    {"first_name": "Benjamin", "last_name": "Gue", "email": "bgue0003@student.monash.edu",
     "password": "!@#$%^&*", "role": "student", "date_of_birth": "1999-02-11"},
    {"first_name": "Jena", "last_name": "Khatri", "email": "jkha0017@student.monash.edu",
     "password": "ASDGY43&", "role": "student", "date_of_birth": "2002-09-30"},
    {"first_name": "Jessica Rose", "last_name": "Pianta", "email": "jpia0005@student.monash.edu",
     "password": "QWGHJFUI", "role": "student", "date_of_birth": "2000-12-05"},
    {"first_name": "Kayla", "last_name": "Robinson", "email": "krob0036@student.monash.edu",
     "password": "876543210", "role": "student", "date_of_birth": "2001-06-18"},
    {"first_name": "Rachel", "last_name": "Tham", "email": "rtha0035@student.monash.edu",
     "password": "^^__@@!!", "role": "student", "date_of_birth": "2003-03-25"},
    {"first_name": "Mei", "last_name": "Zhao", "email": "mei.zhao@gmail.com",
     "password": "TeachMei88!", "role": "teacher", "date_of_birth": "1985-04-12"},
    {"first_name": "Oliver", "last_name": "Smith", "email": "oliver.smith@gmail.com",
     "password": "OLIVERxyz", "role": "teacher", "date_of_birth": "1980-10-03"},
    {"first_name": "Aisha", "last_name": "Khan", "email": "aisha.khan@gmail.com",
     "password": "987654321", "role": "teacher", "date_of_birth": "1990-11-14"},
]


def main():
    for u in dummy_users:
        if not User.objects.filter(email=u['email']).exists():
            payload = u.copy()
            payload['password'] = make_password(payload['password'])  # hashing the password
            payload['username'] = payload['email']  # setting the username as email
            if payload.get('role') == 'teacher':
                payload.setdefault('is_staff', True)
                payload.setdefault('is_approved', True)
            User.objects.create(**payload)  # creating the user in the database

    print("Dummy users created.")


if __name__ == "__main__":
    main()

