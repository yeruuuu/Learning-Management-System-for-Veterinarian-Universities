from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from accounts.models import User
from courses.models import Course

class CoursesTests(APITestCase):

    #just seeting up a teacher , just for testing purposes
    def setUp(self):
        self.teacher = User.objects.create_user(
            email="teacher@cookieuniversity.com",
            password="teacher",
            role="teacher",
            is_approved=True
        )
        #I acknowledge the use of CoPilot (integrated into VScode) to help with minor debugging of the code and understanding the syntax of django for making the test cases. Prompts mainly included the bug/issue I was facing.
# The output and syntax was  well understood by me was then modified further suit the needs of this project.
        self.client.force_authenticate(user=self.teacher) #need to check this line

#mkaing a test case to see if we can make a course
    def test_create_course(self):
        url = reverse('course-create')  
        data = {
            "title": "D120 Dog Course",
            "description": "How to be a good dog",
            "duration": "4_weeks",
            "status": "published"
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Course.objects.count(), 1)


#listing the courses - test case
    def test_list_courses(self):
        Course.objects.create(
            title="C100 Cat Course",
            description="How to be a good cat",
            duration="2_weeks",
            status="published",
            teacher=self.teacher
        )
        print(Course.objects.all())  # Debugging line to check if the course is created
        url = reverse('course-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        



#I acknowledge the use of CoPilot (integrated into VScode) to help with minor debugging of the code and understanding the syntax of django for making the test cases. Prompts mainly included the bug/issue I was facing.
# The output and syntax was  well understood by me was then modified further suit the needs of this project.