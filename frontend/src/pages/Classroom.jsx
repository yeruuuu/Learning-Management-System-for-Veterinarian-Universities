import { useState, useEffect, useCallback, useContext } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router";
import { RoleContext } from "../contexts/RoleContext";
import { ViewContext } from "../contexts/ViewContext";
import api from "../api";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Plus as PlusIcon,
  Clock,
  UserMinus,
  Users
} from "lucide-react";
import ClassroomCard from "../components/ClassroomCard";
import ViewToggle from "../components/ViewToggle";

const Classroom = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [studentWaitlistStatus, setStudentWaitlistStatus] = useState(null);
  const [enrolledClassrooms, setEnrolledClassrooms] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]); // New state for enrolled courses
  const { role, user } = useContext(RoleContext);
  const { view } = useContext(ViewContext);
  const { courseid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  const isTeacher = (role || "").toLowerCase() === "teacher";
  const isStudent = (role || "").toLowerCase() === "student";

  const fetchClassrooms = useCallback(async () => {
    setLoading(true);
    setErrorText("");

    try {
      let endpoint = "/api/classrooms/";

      if (isTeacher) {
        endpoint = "/api/classrooms/teacher/classrooms/";
      } else if (isStudent) {
        if (location.search.includes("enrolled=true")) {
          endpoint = "/api/classrooms/student/classrooms/";
        } else {
          endpoint = "/api/classrooms/student/classrooms/available/";
        }
      }

      const response = await api.get(endpoint);
      const list = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.results)
        ? response.data.results
        : [];

      // Filter to only classrooms for this course
      const filtered = list.filter((c) => {
        const cid = c?.course_id ?? c?.course?.id;
        return courseid ? String(cid) === String(courseid) : true;
      });

      setClassrooms(filtered);
    } catch (err) {
      console.error("Failed to fetch classrooms:", err);
      setErrorText(err?.response?.data?.detail || "Failed to load classrooms");
    } finally {
      setLoading(false);
    }
  }, [isTeacher, isStudent, location.search, courseid]);

  const fetchStudentWaitlistStatus = useCallback(async () => {
    if (!isStudent) return;

    try {
      const response = await api.get("/api/classrooms/student/my-waitlists/");
      if (response.data && response.data.length > 0) {
        const waitlist = response.data[0];
        setStudentWaitlistStatus({
          classroomId: waitlist.classroom_id,
          classroomTitle: waitlist.classroom_title,
          position: waitlist.position
        });
      } else {
        setStudentWaitlistStatus(null);
      }
    } catch (err) {
      console.error("Failed to fetch student waitlist status:", err);
      setStudentWaitlistStatus(null);
    }
  }, [isStudent]);

  const fetchEnrolledClassrooms = useCallback(async () => {
    if (!isStudent) return;

    try {
      const response = await api.get("/api/classrooms/student/classrooms/");
      const enrolledClassroomIds = response.data.map(
        (classroom) => classroom.id || classroom.pk
      );
      const enrolledCourseIds = response.data
        .map((classroom) => classroom.course_id || classroom.course?.id)
        .filter(Boolean);

      setEnrolledClassrooms(enrolledClassroomIds);
      setEnrolledCourses(enrolledCourseIds);
    } catch (err) {
      console.error("Failed to fetch enrolled classrooms:", err);
    }
  }, [isStudent]);

  const handleJoinWaitlist = async (classroomId) => {
    if (!classroomId) {
      console.error("No classroom ID provided");
      toast.error("Invalid classroom ID");
      return;
    }

    try {
      const statusResponse = await api.get(
        `/api/classrooms/student/classrooms/${classroomId}/enrollment-status/`
      );

      if (!statusResponse.data.can_join_waitlist) {
        toast.error("You are already enrolled in a classroom for this course");
        return;
      }

      const response = await api.post(
        `/api/classrooms/student/classrooms/${classroomId}/join-waitlist/`
      );
      toast.success(response.data.detail);

      if (response.data.enrolled) {
        fetchEnrolledClassrooms();
        setStudentWaitlistStatus(null);
      } else {
        fetchStudentWaitlistStatus();
      }
      fetchClassrooms();
    } catch (err) {
      console.error("Failed to join waitlist:", err);
      const errorMessage =
        err?.response?.data?.detail || "Failed to join waitlist";
      toast.error(errorMessage);
    }
  };

  const handleLeaveWaitlist = async () => {
    if (!studentWaitlistStatus) return;

    try {
      // Use DELETE method with the correct URL
      const response = await api.delete(
        `/api/classrooms/student/classrooms/${studentWaitlistStatus.classroomId}/leave-waitlist/`
      );
      toast.success(response.data.detail);
      setStudentWaitlistStatus(null);
      fetchClassrooms();
    } catch (err) {
      console.error("Failed to leave waitlist:", err);
      const errorMessage =
        err?.response?.data?.detail || "Failed to leave waitlist";
      toast.error(errorMessage);
    }
  };

  const handleEnrollment = async (classroomId) => {
    try {
      const statusResponse = await api.get(
        `/api/classrooms/student/classrooms/${classroomId}/enrollment-status/`
      );

      if (!statusResponse.data.can_enroll) {
        toast.error("You are already enrolled in a classroom for this course");
        return;
      }

      const response = await api.post(
        `/api/classrooms/student/classrooms/${classroomId}/enroll/`
      );
      toast.success(response.data.detail);
      fetchClassrooms();
      fetchEnrolledClassrooms();
      fetchStudentWaitlistStatus();
    } catch (err) {
      console.error("Failed to enroll:", err);
      const errorMessage =
        err?.response?.data?.detail || "Failed to enroll in classroom";
      toast.error(errorMessage);
    }
  };

  const handleViewClassroomWaitlist = (classroomId) => {
    navigate(`/teacher/classrooms/${classroomId}/waitlist`);
  };

  useEffect(() => {
    if (role !== undefined) {
      fetchClassrooms();
      if (isStudent) {
        fetchStudentWaitlistStatus();
        fetchEnrolledClassrooms();
      }
    }
  }, [
    role,
    fetchClassrooms,
    fetchStudentWaitlistStatus,
    fetchEnrolledClassrooms
  ]);

  return (
    <div className="min-h-screen px-6 pt-8 bg-cookie-cream">
      <div className="mb-4">
        <Link
          to={`/course/${courseid}`}
          className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown"
        >
          <ArrowLeft className="size-5" /> Back
        </Link>
      </div>

      <h2 className="text-2xl font-bold mb-4 text-cookie-darkbrown">
        {isTeacher
          ? "My Classrooms"
          : location.search.includes("enrolled=true")
          ? "My Enrolled Classrooms"
          : "Available Classrooms"}
      </h2>

      <div className="pl-0 pt-2 flex items-center gap-4 mb-6">
        {/* Teacher buttons */}
        {isTeacher && (
          <div className="flex gap-2">
            <Link
              to={
                courseid
                  ? `/classroom/create/course/${courseid}`
                  : `/classroom/create`
              }
              className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown"
            >
              <PlusIcon className="size-5" /> Create Classroom
            </Link>
            <Link
              to={`/teacher/manage-waitlists/${courseid}`}
              className="btn bg-orange-500 text-white border border-orange-500 hover:bg-orange-600"
            >
              <Users className="size-5" /> Manage All Waitlists
            </Link>
          </div>
        )}

        {/* view toggle */}
        <div className="ml-auto">
          <ViewToggle />
        </div>
      </div>

      {/* Student Waitlist Status Banner */}
      {isStudent &&
        !location.search.includes("enrolled=true") &&
        studentWaitlistStatus && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-700 font-medium">
                  You are currently on the waitlist for:{" "}
                  <span className="font-bold">
                    {studentWaitlistStatus.classroomTitle}
                  </span>
                </p>
                <p className="text-sm text-orange-600">
                  Position: #{studentWaitlistStatus.position}
                </p>
              </div>
              <button
                onClick={handleLeaveWaitlist}
                className="btn btn-sm bg-red-500 text-white border border-red-500 hover:bg-red-600"
              >
                <UserMinus className="size-4 mr-1" />
                Leave Waitlist
              </button>
            </div>
          </div>
        )}

      {/* Classrooms Display */}
      <div>
        {loading ? (
          <div className="text-cookie-darkbrown">Loading classrooms...</div>
        ) : classrooms && classrooms.length > 0 ? (
          <div
            className={`grid grid-cols-1 ${
              view === "grid"
                ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "md:grid-cols-1"
            } gap-6`}
          >
            {classrooms
              .map((classroom) => {
                const id = classroom.id ?? classroom.pk;
                const courseId = classroom.course_id ?? classroom.course?.id;

                if (!id) {
                  console.warn("Classroom missing ID:", classroom);
                  return null;
                }

                const showEnrolled = location.search.includes("enrolled=true");
                const isEnrolledInClassroom = enrolledClassrooms.includes(id);
                const isEnrolledInSameCourse =
                  courseId && enrolledCourses.includes(courseId);
                const isOnThisWaitlist =
                  studentWaitlistStatus?.classroomId === id;
                const isOnAnyWaitlist = !!studentWaitlistStatus;

                return (
                  <div key={id} className="relative">
                    <ClassroomCard
                      classroom={classroom}
                      view={view}
                      onRefresh={fetchClassrooms}
                      onViewWaitlist={
                        isTeacher ? handleViewClassroomWaitlist : null
                      }
                      isStudent={isStudent}
                      isTeacher={isTeacher}
                      showEnrollmentActions={!showEnrolled}
                    />

                    {/* Updated button logic for students */}
                    {isStudent && !showEnrolled && (
                      <div className="mt-2">
                        {isEnrolledInClassroom ? (
                          <div className="btn btn-sm bg-green-500 text-white border border-green-500 w-full cursor-default">
                            <span className="size-4 mr-2">✓</span>
                            Already Enrolled
                          </div>
                        ) : isEnrolledInSameCourse ? (
                          <div className="btn btn-sm bg-gray-400 text-gray-200 border border-gray-400 w-full cursor-not-allowed">
                            <span className="size-4 mr-2">✗</span>
                            Already Enrolled in This Course
                          </div>
                        ) : isOnThisWaitlist ? (
                          <div className="btn btn-sm bg-orange-100 text-orange-600 border border-orange-300 w-full cursor-default">
                            <Clock className="size-4 mr-2" />
                            On Waitlist (#{studentWaitlistStatus.position})
                          </div>
                        ) : isOnAnyWaitlist ? (
                          <div className="btn btn-sm bg-gray-300 text-gray-500 border border-gray-300 w-full cursor-not-allowed">
                            <Clock className="size-4 mr-2" />
                            Already on Another Waitlist
                          </div>
                        ) : (
                          <button
                            onClick={() => handleJoinWaitlist(id)}
                            className="btn btn-sm bg-orange-500 text-white border border-orange-500 hover:bg-orange-600 w-full"
                            disabled={!id}
                          >
                            <Clock className="size-4 mr-2" />
                            Join Waitlist
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
              .filter(Boolean)}{" "}
            {/* Filter out null entries */}
          </div>
        ) : (
          <div className="text-cookie-darkbrown opacity-80">
            {errorText
              ? "Failed to load classrooms"
              : location.search.includes("enrolled=true")
              ? "You are not enrolled in any classrooms yet"
              : "No classrooms available"}
          </div>
        )}
      </div>

      {errorText && (
        <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-lg">
          <div className="text-red-600">
            {errorText}
            {errorText.toLowerCase().includes("unauthorized") && (
              <>
                {" — "}
                <Link to="/login" className="underline">
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Classroom;
