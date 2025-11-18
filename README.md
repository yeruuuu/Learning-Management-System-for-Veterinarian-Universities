## Company Name: 404Works 
Team: CL_Friday4pm_Team2

### Project Name: Pawgress (A Learning Management System)

## Required Dependencies for Running this Project

## 1. Backend  
- Install Django 
    https://www.djangoproject.com/download

- Required Dependencies
    django
    djangorestframework
    djangorestframework-simplejwt
    django-cors-headers
    psycopg2-binary

- 'python -m pip install Pillow' for profile pic

- Running Django Backend
    cd to the backend folder and run ``python manage.py runserver``

    
## 2. Frontend
- Install Node.js
    https://nodejs.org/en/download


- Required Dependencies


- Running the frontend 
    cd to the frontend folder and run ``npm run dev``


## 3. Database
- Install postqreSQL
    https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

How to be in the Backend folder for the terminal:
cd pawgress_lms/backend

- Applying the migrations
    Steps:
    a. Be in the Backend folder
    b. In the terminal, enter ``python manage.py makemigrations``
    c. In the terminal, enter ``python manage.py migrate``

    (if u havent already, Please run 'pip install psycopg2-binary')

- Applying the dummy data
    Steps: 
    a. Make sure migrations are fully updated
    b. Be in the backend folder
    c. In the terminal, enter ``python manage.py shell -c "import dummy_users, dummy_courses, dummy_lessons; dummy_users.main(); dummy_courses.main(); dummy_lessons.main()"``

    It is very important to seed these data in order (users -> courses -> lessons)

    Quick one-liners:
    make sure you are in the backend folder
    -- Users: python manage.py shell -c "import dummy_users; dummy_users.main()"
    -- Courses: python manage.py shell -c "import dummy_courses; dummy_courses.main()"
    -- Lessons: python manage.py shell -c "import dummy_lessons; dummy_lessons.main()"

To remove all data but still keeping the tables and schema:
run ``python manage.py flush`` in backend terminal



#### To Run the Entire Project ,please run both the frontend and the backend at the same time


#### Useful Base URL
- Access the **frontend** at [http://localhost:5173](http://localhost:5173)
- Access the **backend** at [http://localhost:8000](http://localhost:8000)


## Project Structure
```
pawgress_lms/
├── backend/      # Django backend
│   ├── accounts/
│   ├── courses/
│   ├── lessons/
│   └── pawgress_lms/
├── frontend/     # React frontend (Vite)
│   ├── src/
│   └── public/
└── README.md
```



(Please Edit this README to reflect changes, update inaccuracies or as needed.)

*JK*
 

