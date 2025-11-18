import { Navigate, Route, Routes, Link } from "react-router";
import { useState } from "react";
import Home from "./pages/Home";
import Course from "./pages/Course";
import Lesson from "./pages/Lesson";
import Classroom from "./pages/Classroom";
import EditClassroom from "./pages/EditClassroom";
import TeacherManageWaitlists from "./pages/TeacherManageWaitlists";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Help from "./pages/Help";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ProtectedRoutes from "./components/ProtectedRoutes";
import Landing from "./pages/Landing";
import CreateCourse from "./pages/CreateCourse";
import EnrolCourses from "./pages/EnrolCourses";
import ManageTeacher from "./pages/ManageTeacher";
import FontSizeSlider from "./components/GlobalSlider";
import CreateClassroom from "./pages/CreateClassroom";
import CreateLesson from "./pages/CreateLesson";
import LessonDetail from "./pages/LessonDetail";
import GradeLesson from "./pages/GradeLesson";
import EditLesson from "./pages/EditLesson";
import Users from "./pages/Users";
import ManageStudent from "./pages/ManageStudent";
import Grades from "./pages/Grades";
import StudentList from "./pages/StudentList";
import StudentStats from "./pages/StudentStats";
import Reports from "./pages/Reports";
import ClassroomDetail from "./pages/ClassroomDetail";

const Logout = () => {
  localStorage.clear();
  return <Navigate to="/login" />;
};

const SignUpAndLogout = () => {
  localStorage.clear();
  return <SignUp />;
};

const App = () => {
  const [showFontSlider, setShowFontSlider] = useState(false);

  const toggleFontSlider = () => {
    setShowFontSlider(!showFontSlider);
  };

  return (
    <div className="min-h-screen  bg-cookie-cream" data-theme="emerald">
      <FontSizeSlider isVisible={showFontSlider} />
      <Routes>
        <Route
          element={<ProtectedRoutes onToggleFontSlider={toggleFontSlider} />}
        >
          <Route path="/" element={<Home />} />
          <Route path="/course/:courseid" element={<Course />} />
          <Route path="/lesson/course/:courseid" element={<Lesson />} />
          <Route
            path="/lesson/course/:courseid/:lessonid"
            element={<LessonDetail />}
          />
          <Route
            path="/lesson/course/:courseid/:lessonid/grades"
            element={<GradeLesson />}
          />
          <Route
            path="/lesson/course/:courseid/:lessonid/edit"
            element={<EditLesson />}
          />
          <Route path="/classroom/course/:courseid" element={<Classroom />} />
          <Route
            path="/classroom/create/course/:courseid"
            element={<CreateClassroom />}
          />
          <Route
            path="/lesson/create/course/:courseid"
            element={<CreateLesson />}
          />
          <Route path="/course/create" element={<CreateCourse />} />
          <Route path="/course/enroll" element={<EnrolCourses />} />
          <Route path="/approve/teachers" element={<ManageTeacher />} />
          <Route path="/users" element={<Users />} />
          <Route path="/ban/students" element={<ManageStudent />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/help" element={<Help />} />
          <Route path="/course/:courseid/grades" element={<Grades />} />
          <Route path="/grades" element={<Grades />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/course/:courseid/students" element={<StudentList />} />
          <Route
            path="/course/:courseid/student/:studentid"
            element={<StudentStats />}
          />
          <Route
            path="/classroom/course/:courseid/:id"
            element={<ClassroomDetail />}
          />
          <Route
            path="/classroom/course/:courseid/:id/edit"
            element={<EditClassroom />}
          />
          <Route
            path="/teacher/manage-waitlists/:courseid"
            element={<TeacherManageWaitlists />}
          />
        </Route>
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/signup" element={<SignUpAndLogout />} />
        <Route path="/classrooms" element={<Classroom />} />
      </Routes>
    </div>
  );
};

export default App;
