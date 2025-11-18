from accounts.models import User
from courses.models import Course

dummy_courses = [
    {
        "title": "D100 Introduction to Dogs",
        "description": "Welcome to the world of Dogs! Learn about breeds, care, and training.",
        "duration": "4_weeks",
        "status": "published",
        "total_credits": 3.0,
    },
    {
        "title": "D200 Advanced Dog Training",
        "description": "Master advanced techniques for training dogs and understanding behavior.",
        "duration": "3_weeks",
        "status": "published",
        "total_credits": 3.0,
    },
    {
        "title": "A101 Animal Care Basics",
        "description": "Learn the essentials of caring for various animals, from feeding to health.",
        "duration": "2_weeks",
        "status": "published",
        "total_credits": 3.0,
    },
    {
        "title": "A201 Exotic Animals",
        "description": "Explore the fascinating world of exotic pets and their unique needs.",
        "duration": "3_weeks",
        "status": "draft",
        "total_credits": 3.0,
    },
    {
        "title": "D300 Dog Breeds and Genetics",
        "description": "Dive into genetics and breed characteristics of dogs.",
        "duration": "4_weeks",
        "status": "published",
        "total_credits": 3.0,
    },
]



def main():
    # just getting a teacher here and making the courses
    teacher = User.objects.filter(role="teacher", is_approved=True).first()
    if not teacher:
        print("No approved teacher found to assign as course teacher.")
        return

    for course in dummy_courses:
        if not Course.objects.filter(title=course["title"]).exists():
            Course.objects.create(teacher=teacher, **course)

    print("Created the dummy courses.")


if __name__ == "__main__":
    main()
