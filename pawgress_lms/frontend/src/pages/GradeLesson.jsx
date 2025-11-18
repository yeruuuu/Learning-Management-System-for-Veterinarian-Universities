import { useEffect, useState, useContext } from "react";
import { Link, useNavigate, useParams } from "react-router";
import api from "../api";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { RoleContext } from "../contexts/RoleContext";

const GRADES = ["HD", "D", "C", "P", "F"];

const GradeLesson = () => {
  const { courseid, lessonid } = useParams();
  const { role } = useContext(RoleContext);
  const navigate = useNavigate();
  const [lessonTitle, setLessonTitle] = useState("");
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sortCompletions = (arr) => {
    return [...(arr || [])].sort((a, b) => {
      const ag = a.grade ? 1 : 0;
      const bg = b.grade ? 1 : 0;
      if (ag !== bg) return ag - bg; // unmarked (0) first
      return (a.student_name || "").localeCompare(b.student_name || "");
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [lessonRes, compRes] = await Promise.all([
          api.get(`/api/lessons/${courseid}/${lessonid}/`),
          api.get(`/api/lessons/${courseid}/${lessonid}/completed/`)
        ]);
        setLessonTitle(lessonRes?.data?.title || "");
        setCompletions(sortCompletions(compRes?.data || []));
      } catch (e) {
        toast.error("Failed to load grades");
      } finally {
        setLoading(false);
      }
    };
    if (courseid && lessonid) fetchData();
  }, [courseid, lessonid]);

  const handleGradeChange = (studentId, grade) => {
    setCompletions((prev) => prev.map((c) => (c.student_id === studentId ? { ...c, grade } : c)));
  };

  const handleCommentChange = (studentId, comment) => {
    setCompletions((prev) => prev.map((c) => (c.student_id === studentId ? { ...c, comment } : c)));
  };

  const saveRow = async (c) => {
    setSaving(true);
    try {
      await api.post(`/api/lessons/${courseid}/${lessonid}/grade/`, {
        student_id: c.student_id,
        grade: c.grade,
        comment: c.comment || ""
      });
      toast.success("Saved");
      setCompletions((prev) => sortCompletions(prev));
    } catch (e) {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (role !== "teacher") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-cookie-darkbrown">Only teachers can access grades</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-cookie-darkbrown">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-8 pb-16">
      <div className="mt-2 flex items-center gap-3">
        <Link
          to={`/lesson/course/${courseid}/${lessonid}`}
          className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown"
        >
          <ArrowLeft className="size-5" />
          Back
        </Link>
      </div>

      <div className="mt-4">
        <h1 className="text-3xl font-bold text-cookie-darkbrown">Mark Grades{lessonTitle ? `: ${lessonTitle}` : ""}</h1>
      </div>

      <div className="mt-6">
        {completions.length > 0 ? (
          <div className="space-y-3">
            {completions.map((c) => (
              <div key={c.student_id} className="bg-cookie-lightcream border border-cookie-darkbrown rounded-md p-4 text-cookie-darkbrown">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{c.student_name}</div>
                    <div className="text-sm opacity-80">{c.student_email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      className="select select-bordered bg-cookie-lightcream text-cookie-darkbrown"
                      value={c.grade || ""}
                      onChange={(e) => handleGradeChange(c.student_id, e.target.value)}
                    >
                      <option value="">Select grade</option>
                      {GRADES.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                    <button
                      className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown"
                      disabled={saving || !c.grade}
                      onClick={() => saveRow(c)}
                    >
                      Save
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="text-sm opacity-80">Comment</label>
                  <textarea
                    className="mt-1 w-full rounded-md p-2 bg-cookie-lightcream border border-cookie-darkbrown text-cookie-darkbrown"
                    rows={3}
                    value={c.comment || ""}
                    onChange={(e) => handleCommentChange(c.student_id, e.target.value)}
                    placeholder="Optional comments..."
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-cookie-darkbrown opacity-80">No students have completed this lesson yet.</p>
        )}
      </div>
    </div>
  );
};

export default GradeLesson;
