import { useEffect, useState, useContext } from "react";
import { Link, useNavigate, useParams } from "react-router";
import api from "../api";
import toast from "react-hot-toast";
import { ArrowLeft, Check } from "lucide-react";
import { RoleContext } from "../contexts/RoleContext";
import { TEACHING_GUIDELINES_URL } from "../constants";

const LessonDetail = () => {
  const { courseid, lessonid } = useParams();
  const { role } = useContext(RoleContext);
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [lessonNumber, setLessonNumber] = useState(null);
  const [completions, setCompletions] = useState([]);
  const [savingGrade, setSavingGrade] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/lessons/${courseid}/${lessonid}/`);
        setLesson(res.data);
        setIsCompleted(Boolean(res.data?.is_completed));
      } catch (error) {
        toast.error("Failed to load lesson");
      } finally {
        setLoading(false);
      }
    };
    if (courseid && lessonid) fetchLesson();
  }, [courseid, lessonid]);

  useEffect(() => {
    const fetchNumber = async () => {
      try {
        const res = await api.get(`/api/lessons/${courseid}/`);
        const sorted = (res.data || []).sort((a, b) => (a.id || 0) - (b.id || 0));
        const idx = sorted.findIndex((x) => String(x.id) === String(lessonid));
        if (idx >= 0) setLessonNumber(idx + 1);
      } catch {}
    };
    if (courseid && lessonid) fetchNumber();
  }, [courseid, lessonid]);

  // Fetch completions for grading (teachers)
  useEffect(() => {
    const fetchCompletions = async () => {
      if (role !== "teacher") return;
      try {
        const res = await api.get(`/api/lessons/${courseid}/${lessonid}/completed/`);
        setCompletions(res.data || []);
      } catch (e) {
        // silent
      }
    };
    if (courseid && lessonid) fetchCompletions();
  }, [courseid, lessonid, role]);

  const handleMarkComplete = async () => {
    try {
      await api.post(`/api/lessons/${courseid}/${lessonid}/complete/`);
      toast.success("Marked completed");
      setIsCompleted(true);
    } catch (error) {
      const status = error?.response?.status;
      if (status === 403) toast.error("Only students can mark completed");
      else toast.error("Failed to mark completed");
    }
  };

  const handleUnmark = async () => {
    try {
      await api.delete(`/api/lessons/${courseid}/${lessonid}/complete/`);
      toast.success("Unmarked");
      setIsCompleted(false);
    } catch (error) {
      toast.error("Failed to unmark");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-cookie-darkbrown">Loading lesson...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-cookie-darkbrown">Lesson not found</p>
      </div>
    );
  }

  // Parse resources: try JSON array; fallback to CSV list
  let parsedResources = [];
  let parsedFromJson = false;
  try {
    if (lesson.resources) {
      const maybe = JSON.parse(lesson.resources);
      if (Array.isArray(maybe)) {
        parsedResources = maybe;
        parsedFromJson = true;
      }
    }
  } catch {}
  const csvFallback = !parsedFromJson
    ? (lesson.resources || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const canComplete = role === "student" && lesson.accessible;

  const handleGradeChange = async (studentId, grade) => {
    setSavingGrade(true);
    try {
      await api.post(`/api/lessons/${courseid}/${lessonid}/grade/`, { student_id: studentId, grade });
      setCompletions((prev) => prev.map((c) => (c.student_id === studentId ? { ...c, grade } : c)));
      toast.success("Grade saved");
    } catch (e) {
      toast.error("Failed to save grade");
    } finally {
      setSavingGrade(false);
    }
  };

  return (
    <div className="min-h-screen px-8 pb-16">
      <div className="mt-2 flex items-center gap-3">
        <Link
          to={`/lesson/course/${courseid}`}
          className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown"
        >
          <ArrowLeft className="size-5" />
          Back
        </Link>
        {role === "teacher" && (
          <button
            className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown"
            onClick={() => navigate(`/lesson/course/${courseid}/${lessonid}/edit`)}
          >
            Edit Lesson
          </button>
        )}
        {role === "teacher" && (
          <button
            className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown"
            onClick={() => navigate(`/lesson/course/${courseid}/${lessonid}/grades`)}
          >
            Mark Grades
          </button>
        )}
      </div>

      <div className="mt-4">
        <h1 className="text-3xl font-bold text-cookie-darkbrown">
          {typeof lessonNumber === "number" ? `Lesson ${lessonNumber}: ` : ""}
          {lesson.title}
        </h1>
        <p className="mt-2 text-cookie-darkbrown opacity-90">{lesson.description}</p>

        {role === "teacher" && (
          <div className="mt-3 bg-cookie-lightorange text-cookie-darkbrown border border-cookie-darkbrown rounded-md p-3">
            <span className="font-medium">Teaching guidelines:</span>
            <a
              href={TEACHING_GUIDELINES_URL}
              target="_blank"
              rel="noreferrer"
              className="underline ml-2"
            >
              Australian Veterinary Association policies
            </a>
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-cookie-darkbrown">
          <div className="bg-cookie-lightcream rounded-md p-3">
            <div className="text-sm opacity-70">Credits</div>
            <div className="font-semibold">{Number(lesson.credit_value || 0).toFixed(1)}</div>
          </div>
          <div className="bg-cookie-lightcream rounded-md p-3">
            <div className="text-sm opacity-70">Estimated Duration</div>
            <div className="font-semibold">{String(lesson.estimated_duration || "").replace("_", " ")}</div>
          </div>
          <div className="bg-cookie-lightcream rounded-md p-3">
            <div className="text-sm opacity-70">Status</div>
            <div className="font-semibold capitalize">{lesson.status}</div>
          </div>
        </div>

        {lesson.objectives && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-cookie-darkbrown">Objectives</h2>
            <pre className="mt-2 whitespace-pre-wrap bg-cookie-lightcream p-3 rounded-md text-cookie-darkbrown">{lesson.objectives}</pre>
          </div>
        )}

        <div className="mt-6">
          <h2 className="text-xl font-semibold text-cookie-darkbrown">Resources</h2>
          {parsedResources.length > 0 ? (
            <ul className="mt-2 space-y-2 text-cookie-darkbrown">
              {parsedResources.map((r, idx) => (
                <li key={idx} className="bg-cookie-lightcream rounded-md p-3 border border-cookie-darkbrown">
                  <div className="font-semibold">{r.title || r.url || "Resource"}</div>
                  {r.description && (
                    <div className="text-sm opacity-80">{r.description}</div>
                  )}
                  {r.url && (
                    <a className="underline" href={r.url} target="_blank" rel="noreferrer">
                      {r.url}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : (!parsedFromJson && csvFallback.length > 0) ? (
            <ul className="list-disc pl-6 mt-2 text-cookie-darkbrown">
              {csvFallback.map((r, idx) => (
                <li key={idx}>
                  <a className="underline" href={r} target="_blank" rel="noreferrer">
                    {r}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="opacity-80">No resources provided.</p>
          )}
        </div>

        {lesson.additional_notes && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-cookie-darkbrown">Additional Notes</h2>
            <pre className="mt-2 whitespace-pre-wrap bg-cookie-lightcream p-3 rounded-md text-cookie-darkbrown">{lesson.additional_notes}</pre>
          </div>
        )}

        {/* Grades moved to dedicated screen */}

        {canComplete && (
          <div className="mt-8">
            {!isCompleted ? (
              <button
                className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown"
                onClick={handleMarkComplete}
              >
                <Check className="size-5" />
                Mark Completed
              </button>
            ) : (
              <button
                className="btn bg-cookie-lightorange text-cookie-darkbrown border border-cookie-darkbrown"
                onClick={handleUnmark}
              >
                Unmark
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonDetail;
