import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router";
import { ArrowLeft, User, BookOpen, Award } from "lucide-react";
import api from "../api";
import toast from "react-hot-toast";

const StudentStats = () => {
  const { courseid, studentid } = useParams();
  const location = useLocation();
  const [student, setStudent] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Use teacher view of a student's completions for this course
        const res = await api.get(`/api/lessons/course/${courseid}/student/${studentid}/completions/`);

        // Student basic info from response
        const sName = res.data?.student_name || "";
        const parts = sName.split(" ");
        const first = parts[0] || "";
        const last = parts.slice(1).join(" ") || "";
        setStudent({
          id: res.data?.student_id || studentid,
          first_name: first,
          last_name: last,
          email: res.data?.student_email || "",
          role: "student",
          avatar_url: res.data?.student_avatar_url || ""
        });

        const total = Number(res.data?.total_credits || 0);
        const completed = Number(res.data?.completed_credits || 0);
        const pct = Number(res.data?.progress_percentage || (total > 0 ? (completed / total) * 100 : 0));
        setCourseData({
          course_title: res.data?.course_title || "",
          total_credits: total,
          completed_credits: completed,
          progress_percentage: Number(pct.toFixed(1))
        });

        const list = res.data?.completions || [];
        setCompletions(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load student information");
      } finally {
        setLoading(false);
      }
    };

    if (courseid && studentid) {
      fetchData();
    }
  }, [courseid, studentid]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center pb-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cookie-brown"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen pb-12">
        <div className="ml-8 mt-2">
          <Link
            to={`/course/${courseid}/students`}
            className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown"
          >
            <ArrowLeft className="size-5" />
            Back to Student List
          </Link>
        </div>
        <div className="flex justify-center items-center py-12">
          <p className="text-cookie-darkbrown text-2xl">Student not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Back Button */}
      <div className="ml-8 mt-2">
        <Link
          to={`/course/${courseid}/students`}
          className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown"
        >
          <ArrowLeft className="size-5" />
          Back to Student List
        </Link>
      </div>

      {/* Header Section */}
      <div className="px-8 pt-4">
        <div className="flex items-center gap-4 mb-2">
          <div className="avatar">
            {student?.avatar_url ? (
              <div className="w-16 h-16 rounded-full overflow-hidden bg-cookie-lightbrown border border-cookie-darkbrown">
                <img
                  src={student.avatar_url}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-cookie-lightbrown flex items-center justify-center">
                <User className="size-8 text-cookie-darkbrown" />
              </div>
            )}
          </div>
          <div>
            <h2 className="font-bold text-3xl">
              {student.first_name} {student.last_name}
            </h2>
            <p className="text-gray-600">{student.email}</p>
          </div>
        </div>
        <p className="text-cookie-brown text-lg font-medium mt-2">
          Course: {courseData?.course_title || "Loading..."}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="px-8 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Course Completion Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-cookie-orange">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="size-6 text-cookie-orange" />
              <h3 className="text-xl font-bold text-cookie-darkbrown">
                Course Completion
              </h3>
            </div>
            {courseData ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-medium">
                    Completion Progress
                  </span>
                  <span className="text-2xl font-bold text-cookie-orange">
                    {Number(courseData.progress_percentage || 0).toFixed(1)}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cookie-orange to-cookie-brown h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                    style={{ width: `${Number(courseData.progress_percentage || 0)}%` }}
                  >
                    {Number(courseData.progress_percentage) > 10 && (
                      <span className="text-white text-sm font-semibold">
                        {Number(courseData.progress_percentage).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-3">
                  <span className="text-gray-600">Credits Earned</span>
                  <span className="text-lg font-semibold text-cookie-brown">
                    {Number(courseData.completed_credits || 0).toFixed(1)} / {Number(courseData.total_credits || 0).toFixed(1)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">
                  Loading progress data...
                </p>
              </div>
            )}
          </div>

          {/* Grades Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-cookie-brown">
            <div className="flex items-center gap-3 mb-4">
              <Award className="size-6 text-cookie-brown" />
              <h3 className="text-xl font-bold text-cookie-darkbrown">
                Grades
              </h3>
            </div>
            {completions && completions.length > 0 ? (
              <div className="space-y-2">
                {completions.map((c, idx) => (
                  <div key={idx} className="bg-cookie-lightcream border border-cookie-darkbrown rounded-md p-3 flex items-center justify-between text-cookie-darkbrown">
                    <div>
                      <div className="font-medium">{c.lesson_title || c.title || "Lesson"}</div>
                      {c.completed_at && (
                        <div className="text-sm opacity-80">Completed: {new Date(c.completed_at).toLocaleString()}</div>
                      )}
                      {c.grade && c.comment && (
                        <div className="text-sm mt-1">Comment: {c.comment}</div>
                      )}
                    </div>
                    <div>
                      <span className={`px-2 py-1 rounded text-sm ${c.grade ? 'bg-green-100' : 'bg-yellow-100'}`}>
                        {c.grade ? `Marked: ${c.grade}` : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">
                  No graded lessons yet for this course.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentStats;
