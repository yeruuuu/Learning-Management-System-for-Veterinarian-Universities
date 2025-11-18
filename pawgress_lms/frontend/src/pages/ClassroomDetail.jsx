import { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { RoleContext } from "../contexts/RoleContext"; // Fix the import
import Navbar from "../components/Navbar";
import api from "../api";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Users,
  Calendar,
  MapPin,
  Clock,
  Edit,
  Trash2,
  BookOpen,
  User
} from "lucide-react";

const ClassroomDetail = () => {
  const [showFontSlider, setShowFontSlider] = useState(false);
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { id, courseid } = useParams();
  const { role } = useContext(RoleContext); // Fix the context usage
  const navigate = useNavigate();

  const isTeacher = (role || "").toLowerCase() === "teacher";

  // Get user from localStorage since useAuth was removed
  let user = null;
  try {
    const raw =
      localStorage.getItem("user") ?? localStorage.getItem("authUser") ?? null;
    if (raw) {
      try {
        user = JSON.parse(raw);
      } catch {
        user = { id: null, role: raw };
      }
    }
  } catch (err) {
    console.warn("Failed to read user from localStorage", err);
    user = null;
  }

  const currentUserId = user?.id ?? user?.pk ?? null;

  const fetchClassroom = async () => {
    try {
      setLoading(true);
      let res;

      // Try both endpoints with fallback
      try {
        if (isTeacher) {
          res = await api.get(`/api/classrooms/teacher/classrooms/${id}/`);
        } else {
          res = await api.get(`/api/classrooms/student/classrooms/${id}/`);
        }
      } catch (teacherErr) {
        if (teacherErr.response?.status === 401 && isTeacher) {
          // Fallback to student endpoint
          console.log("Teacher endpoint failed, trying student endpoint...");
          res = await api.get(`/api/classrooms/student/classrooms/${id}/`);
        } else {
          throw teacherErr;
        }
      }

      setClassroom(res.data);
      console.log("Classroom data:", res.data);
      console.log("Current user ID:", currentUserId);
    } catch (err) {
      console.error("Failed to fetch classroom:", err);

      // Check if it's an auth error
      if (err.response?.status === 401) {
        toast.error("Authentication required. Please log in again.");
        navigate("/login");
        return;
      }

      toast.error("Failed to load classroom details");
      if (err?.response?.status === 404) {
        navigate("/classrooms");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && role !== undefined) {
      fetchClassroom();
    }
  }, [id, role]);

  const handleEnroll = async () => {
    if (processing) return;
    setProcessing(true);
    try {
      if (classroom.is_enrolled) {
        await api.delete(`/api/classrooms/student/classrooms/${id}/unenroll/`);
        toast.success("Successfully unenrolled");
      } else {
        await api.post(`/api/classrooms/student/classrooms/${id}/enroll/`);
        toast.success("Successfully enrolled");
      }
      fetchClassroom();
    } catch (err) {
      console.error("Enroll/unenroll failed", err);
      const msg = err?.response?.data?.detail || "Operation failed";
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (
      deleting ||
      !window.confirm("Are you sure you want to delete this classroom?")
    )
      return;
    setDeleting(true);
    try {
      await api.delete(`/api/classrooms/teacher/classrooms/${id}/`);
      toast.success("Classroom deleted successfully");
      navigate(`/classroom/course/${courseid}`);
    } catch (err) {
      console.error("Delete failed", err);
      const msg = err?.response?.data?.detail || "Failed to delete classroom";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  const toggleFontSlider = () => {
    setShowFontSlider(!showFontSlider);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cookie-cream">
        <Navbar onToggleFontSlider={toggleFontSlider} />
        <div className="px-6 pt-8">
          <div className="text-cookie-darkbrown">
            Loading classroom details...
          </div>
        </div>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="min-h-screen bg-cookie-cream">
        <div className="px-6 pt-8">
          <div className="text-red-600">Classroom not found</div>
          <Link
            to={`/classroom/course/${courseid}`}
            className="btn mt-4 bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown"
          >
            <ArrowLeft className="size-4" /> Back to Classrooms
          </Link>
        </div>
      </div>
    );
  }

  const isOwner =
    isTeacher &&
    currentUserId &&
    (String(currentUserId) === String(classroom.teacher_id) ||
      String(currentUserId) === String(classroom.teacher?.id) ||
      String(currentUserId) === String(classroom.teacher?.pk) ||
      String(currentUserId) === String(classroom.teacher));

  console.log("Is owner check:", {
    isTeacher,
    currentUserId,
    teacherId: classroom.teacher_id,
    teacher: classroom.teacher,
    isOwner
  });

  return (
    <div className="min-h-screen bg-cookie-cream">
      <div className="px-6 pt-8">
        <div className="mb-6">
          <Link
            to={`/classroom/course/${courseid}`}
            className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown"
          >
            <ArrowLeft className="size-5" /> Back to Classrooms
          </Link>
        </div>

        <div className="max-w-4xl mx-auto bg-cookie-lightcream rounded-lg shadow-lg overflow-hidden">
          {/* Header Section - Banner Style */}
          <div className="bg-cookie-lightorange p-0">
            <div className="bg-cookie-lightorange text-center py-6">
              <div className="text-4xl font-bold text-cookie-darkbrown">
                #{classroom.id}
              </div>
            </div>

            <div className="bg-cookie-lightcream p-8">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-cookie-darkbrown mb-2">
                    {classroom.title}
                  </h1>
                  <div className="flex items-center gap-2 text-cookie-darkbrown">
                    <User className="size-5" />
                    <span className="text-lg">
                      Taught by {classroom.teacher_name}
                    </span>
                  </div>
                </div>

                <div className="text-right ml-6">
                  {!isTeacher && classroom.is_enrolled && (
                    <div className="px-3 py-1 bg-green-100 border border-green-300 rounded-full text-sm text-green-800">
                      ✓ Enrolled
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Reduced padding */}
          <div className="p-4 border-b border-cookie-lightorange bg-cookie-lightcream">
            <div className="flex gap-2 justify-end">
              {/* Student enrollment button */}
              {!isTeacher && (
                <button
                  onClick={handleEnroll}
                  disabled={processing}
                  className={`btn ${
                    classroom.is_enrolled
                      ? "btn-outline border-cookie-darkbrown text-cookie-darkbrown hover:bg-cookie-darkbrown hover:text-cookie-white"
                      : "bg-cookie-darkbrown text-cookie-white border-cookie-darkbrown hover:bg-cookie-darkbrown/90"
                  }`}
                >
                  {processing
                    ? "Processing..."
                    : classroom.is_enrolled
                    ? "Unenroll"
                    : "Enroll"}
                </button>
              )}

              {/* Teacher edit/delete buttons */}
              {isTeacher && (
                <>
                  <Link
                    to={`/classroom/course/${courseid}/${id}/edit`}
                    className="btn btn-outline border-cookie-darkbrown text-cookie-darkbrown hover:bg-cookie-darkbrown hover:text-cookie-white"
                  >
                    <Edit className="size-4" />
                    Edit Classroom
                  </Link>

                  {isOwner && (
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="btn btn-error text-white hover:bg-red-600"
                    >
                      {deleting ? (
                        "Deleting..."
                      ) : (
                        <>
                          <Trash2 className="size-4" />
                          Delete Classroom
                        </>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8 bg-cookie-lightcream">
            {/* Description */}
            {classroom.description && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2 text-cookie-darkbrown">
                  <BookOpen className="size-5 text-cookie-darkbrown" />
                  Description
                </h2>
                <p className="text-cookie-darkbrown leading-relaxed">
                  {classroom.description}
                </p>
              </div>
            )}

            {/* Classroom Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-cookie-darkbrown">
                    Enrollment & Capacity
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Users className="size-5 text-cookie-darkbrown" />
                      <div>
                        <span className="font-medium text-cookie-darkbrown">
                          Current Enrollment:
                        </span>
                        <span className="ml-2 text-cookie-darkbrown">
                          {classroom.enrolled_students_count || 0} students
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Users className="size-5 text-cookie-darkbrown" />
                      <div>
                        <span className="font-medium text-cookie-darkbrown">
                          Total Capacity:
                        </span>
                        <span className="ml-2 text-cookie-darkbrown">
                          {classroom.capacity} students
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-cookie-cream rounded-full h-2">
                      <div
                        className="bg-cookie-lightorange h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            ((classroom.enrolled_students_count || 0) /
                              classroom.capacity) *
                              100,
                            100
                          )}%`
                        }}
                      ></div>
                    </div>
                    <p className="text-sm text-cookie-darkbrown opacity-80">
                      {classroom.capacity -
                        (classroom.enrolled_students_count || 0)}{" "}
                      seats remaining
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 text-cookie-darkbrown">
                    Location & Schedule
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <MapPin className="size-5 text-cookie-darkbrown" />
                      <div>
                        <span className="font-medium text-cookie-darkbrown">
                          Location:
                        </span>
                        <span className="ml-2 text-cookie-darkbrown">
                          {classroom.location || "To be announced"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="size-5 text-cookie-darkbrown" />
                      <div>
                        <span className="font-medium text-cookie-darkbrown">
                          Frequency:
                        </span>
                        <span className="ml-2 text-cookie-darkbrown">
                          {classroom.frequency} times per week
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Duration & Dates */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-cookie-darkbrown">
                    Duration & Dates
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="size-5 text-cookie-darkbrown" />
                      <div>
                        <span className="font-medium text-cookie-darkbrown">
                          Start Date:
                        </span>
                        <span className="ml-2 text-cookie-darkbrown">
                          {classroom.class_start_date || classroom.start_date
                            ? new Date(
                                classroom.class_start_date ||
                                  classroom.start_date
                              ).toLocaleDateString()
                            : "TBA"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Calendar className="size-5 text-cookie-darkbrown" />
                      <div>
                        <span className="font-medium text-cookie-darkbrown">
                          End Date:
                        </span>
                        <span className="ml-2 text-cookie-darkbrown">
                          {classroom.class_end_date || classroom.end_date
                            ? new Date(
                                classroom.class_end_date || classroom.end_date
                              ).toLocaleDateString()
                            : "TBA"}
                        </span>
                      </div>
                    </div>

                    {/* Add time display */}
                    {(classroom.class_start_time ||
                      classroom.class_end_time) && (
                      <div className="flex items-center gap-3">
                        <Clock className="size-5 text-cookie-darkbrown" />
                        <div>
                          <span className="font-medium text-cookie-darkbrown">
                            Time:
                          </span>
                          <span className="ml-2 text-cookie-darkbrown">
                            {classroom.class_start_time || "09:00"} -{" "}
                            {classroom.class_end_time || "10:00"}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <Clock className="size-5 text-cookie-darkbrown" />
                      <div>
                        <span className="font-medium text-cookie-darkbrown">
                          Duration:
                        </span>
                        <span className="ml-2 text-cookie-darkbrown">
                          {classroom.duration_weeks} weeks
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassroomDetail;
