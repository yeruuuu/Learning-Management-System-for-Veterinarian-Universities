from django.test import TestCase

# Create your tests here.
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from accounts.models import User

class AccountsTests(APITestCase):

    #making this initial testing set up function, will start off from here
    def setUp(self):
        self.user = User.objects.create_user(
            email="tesing@cookieuniversity.com",
            password="testing",
            role="student",
            is_approved=True
        )


    #just testing the backend registration feature
    def test_user_registration(self):
        url = reverse('register') #this is using the endpoint from the url
        data = {
            "email": "tester@university.com",
            "password": "password",
            "role": "student",
            "first_name": "Jeeennna",
            "last_name": "Khat"
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


    #just testing the backend login feature
    def test_user_login(self):
        url = reverse('token_obtain_pair')
        data = {
            "email": "tesing@cookieuniversity.com",
            "password": "testing"
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)


#I acknowledge the use of CoPilot (integrated into VScode) to help with minor debugging of the code and understanding the syntax of django for making the test cases. Prompts mainly included the bug/issue I was facing.
# The output and syntax was  well understood by me was then modified further suit the needs of this project.