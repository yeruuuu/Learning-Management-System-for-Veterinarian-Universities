import { useEffect, useMemo, useState, useContext } from "react";
import { useParams, Link } from "react-router";
import api from "../api";
import toast from "react-hot-toast";
import { RoleContext } from "../contexts/RoleContext";
import { ArrowLeft } from "lucide-react";

const Grades = () => {
  const { role } = useContext(RoleContext);
  const { courseid } = useParams();
  const [courseTitle, setCourseTitle] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/lessons/my/completions/`, {
          params: courseid ? { course_id: courseid } : undefined
        });
        setItems(res.data || []);
      } catch (e) {
        toast.error("Failed to load grades");
      } finally {
        setLoading(false);
      }
    };
    if (role !== "admin") fetchGrades();
  }, [role, courseid]);

  // Fetch course title for course-scoped view
  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseid) {
        setCourseTitle("");
        return;
      }
      try {
        const res = await api.get(`/api/courses/${courseid}/`);
        setCourseTitle(res.data?.title || "");
      } catch {
        setCourseTitle("");
      }
    };
    fetchCourse();
  }, [courseid]);

  const grouped = useMemo(() => {
    // Group by course for better readability
    const map = new Map();
    (items || []).forEach((i) => {
      const key = `${i.course_id}::${i.course_title}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(i);
    });
    return Array.from(map.entries()).map(([k, list]) => {
      const [course_id, course_title] = k.split("::");
      return { course_id, course_title, list };
    });
  }, [items]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-cookie-darkbrown">Loading grades...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-8 pb-16">
      <div className="mt-2">
        {/* Back Button */}
        <div className="mb-4">
          <Link
            to="/"
            className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown hover:bg-cookie-brown"
          >
            <ArrowLeft className="size-5" /> Back
          </Link>
        </div>

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-cookie-darkbrown">
            {courseid ? `My Grades: ${courseTitle}` : "My Grades"}
          </h1>
          {!courseid && (
            <Link
              to="/"
              className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown"
            >
              Back to Dashboard
            </Link>
          )}
          {courseid && (
            <Link
              to="/grades"
              className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown"
            >
              See All Courses
            </Link>
          )}
        </div>
      </div>

      {grouped.length > 0 ? (
        <div className="mt-6 space-y-6">
          {grouped.map((g) => (
            <div key={g.course_id} className="text-cookie-darkbrown">
              {!courseid && (
                <h2 className="text-xl font-semibold">{g.course_title}</h2>
              )}
              <div className="mt-2 space-y-2">
                {g.list.map((i) => (
                  <div
                    key={`${i.course_id}-${i.lesson_id}`}
                    className="bg-cookie-lightcream border border-cookie-darkbrown rounded-md p-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">{i.lesson_title}</div>
                      <div className="text-sm opacity-80">
                        Completed: {new Date(i.completed_at).toLocaleString()}
                      </div>
                      {i.grade && i.comment && (
                        <div className="text-sm mt-1">Comment: {i.comment}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          i.grade ? "bg-green-100" : "bg-yellow-100"
                        }`}
                      >
                        {i.grade ? `Marked: ${i.grade}` : "Pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="min-h-40 flex items-center">
          <p className="text-cookie-darkbrown opacity-80">
            No lesson completions yet.
          </p>
        </div>
      )}
    </div>
  );
};
export default Grades;
