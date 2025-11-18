import { useEffect, useState, useContext, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Trash2 } from "lucide-react";
import api from "../api";
import toast from "react-hot-toast";
import { RoleContext } from "../contexts/RoleContext";
import { TEACHING_GUIDELINES_URL } from "../constants";

const DURATION_OPTIONS = [
  { value: "1_hour", label: "1 Hour" },
  { value: "2_hours", label: "2 Hours" },
  { value: "3_hours", label: "3 Hours" }
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" }
];

const EditLesson = () => {
  const navigate = useNavigate();
  const { courseid, lessonid } = useParams();
  const { role } = useContext(RoleContext);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [objectives, setObjectives] = useState("");
  const [creditValue, setCreditValue] = useState(0.0);
  const [estimatedDuration, setEstimatedDuration] = useState("1_hour");
  const [status, setStatus] = useState("draft");
  // Structured resources
  const [resources, setResources] = useState([]);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [prereqOptions, setPrereqOptions] = useState([]);
  const [prerequisites, setPrerequisites] = useState([]);
  const [courseCredits, setCourseCredits] = useState(0);
  const [otherCredits, setOtherCredits] = useState(0);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [lessonRes, lessonsRes, courseRes] = await Promise.all([
          api.get(`/api/lessons/${courseid}/${lessonid}/`),
          api.get(`/api/lessons/${courseid}/`),
          api.get(`/api/courses/${courseid}/`)
        ]);
        const l = lessonRes.data;
        setTitle(l.title || "");
        setDescription(l.description || "");
        setObjectives(l.objectives || "");
        setCreditValue(l.credit_value ?? 0.0);
        setEstimatedDuration(l.estimated_duration || "1_hour");
        setStatus(l.status || "draft");
        // Parse resources: prefer JSON array, fallback to CSV into url-only items
        let parsed = [];
        try {
          if (l.resources) {
            const maybe = JSON.parse(l.resources);
            if (Array.isArray(maybe)) parsed = maybe;
          }
        } catch {}
        if (!parsed.length && (l.resources || "").trim()) {
          parsed = (l.resources || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .map((u) => ({ title: "", url: u, description: "" }));
        }
        setResources(parsed);
        setAdditionalNotes(l.additional_notes || "");
        const options = (lessonsRes.data || []).filter((x) => x.id !== l.id);
        setPrereqOptions(options);
        setPrerequisites(l.prerequisites || []);
        setCourseCredits(courseRes?.data?.total_credits ?? 0);
        const sumOthers = options.reduce((acc, x) => acc + (parseFloat(x.credit_value) || 0), 0);
        setOtherCredits(sumOthers);
      } catch (error) {
        toast.error("Failed to load lesson for edit");
      } finally {
        setLoading(false);
      }
    };
    if (courseid && lessonid) bootstrap();
  }, [courseid, lessonid]);

  const onTogglePrereq = (id) => {
    setPrerequisites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (role !== "teacher") {
      toast.error("Only teachers can edit lessons");
      return;
    }
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    setSaving(true);
    try {
      await api.patch(`/api/lessons/${courseid}/${lessonid}/`, {
        title,
        description,
        objectives,
        additional_notes: additionalNotes,
        credit_value: parseFloat(creditValue) || 0,
        estimated_duration: estimatedDuration,
        status,
        resources: JSON.stringify(resources),
        prerequisites
      });
      toast.success("Lesson updated");
      navigate(`/lesson/course/${courseid}/${lessonid}`);
    } catch (error) {
      const s = error?.response?.status;
      if (s === 403) toast.error("You don't have access to edit this lesson");
      else if (s === 400) toast.error("Invalid data");
      else toast.error("Failed to update lesson");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this lesson? This cannot be undone.")) return;
    try {
      await api.delete(`/api/lessons/${courseid}/${lessonid}/`);
      toast.success("Lesson deleted");
      navigate(`/lesson/course/${courseid}`);
    } catch (error) {
      const s = error?.response?.status;
      if (s === 403) toast.error("You don't have access to delete this lesson");
      else toast.error("Failed to delete lesson");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-cookie-darkbrown">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="ml-8 mt-2 flex items-center gap-3">
        <Link
          to={`/lesson/course/${courseid}/${lessonid}`}
          className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown"
        >
          <ArrowLeft className="size-5" />
          Back
        </Link>
        <button
          onClick={handleDelete}
          className="btn bg-cookie-lightorange text-cookie-darkbrown border border-cookie-darkbrown"
        >
          <Trash2 className="size-5" />
          Delete
        </button>
      </div>

      <div className="px-8">
        <h2 className="font-bold text-3xl pt-2">Edit Lesson</h2>
      </div>

      {role === "teacher" && (
        <div className="mx-8 mt-3 bg-cookie-lightorange text-cookie-darkbrown border border-cookie-darkbrown rounded-md p-3">
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

      <form className="max-w-3xl mx-8 mt-6 space-y-4" onSubmit={handleSave}>
        <div className="flex flex-col gap-1">
          <label className="text-cookie-darkbrown font-medium">Title</label>
          <input
            className="rounded-md p-2 bg-cookie-lightcream border border-cookie-darkbrown text-cookie-darkbrown"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-cookie-darkbrown font-medium">Description</label>
          <textarea
            className="rounded-md p-2 bg-cookie-lightcream border border-cookie-darkbrown text-cookie-darkbrown min-h-28"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-cookie-darkbrown font-medium">Objectives</label>
          <textarea
            className="rounded-md p-2 bg-cookie-lightcream border border-cookie-darkbrown text-cookie-darkbrown min-h-24"
            value={objectives}
            onChange={(e) => setObjectives(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-cookie-darkbrown font-medium">Credits</label>
            <input
              type="number"
              min={0}
              step="0.1"
              className="rounded-md p-2 bg-cookie-lightcream border border-cookie-darkbrown text-cookie-darkbrown"
              value={creditValue}
              onChange={(e) => setCreditValue(e.target.value)}
            />
            <span className="text-xs text-cookie-darkbrown opacity-80 mt-1">
              Remaining after change: {(
                (parseFloat(courseCredits) || 0) - (otherCredits + (parseFloat(creditValue) || 0))
              ).toFixed(1)}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-cookie-darkbrown font-medium">Duration</label>
            <select
              className="rounded-md p-2 bg-cookie-lightcream border border-cookie-darkbrown text-cookie-darkbrown"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-cookie-darkbrown font-medium">Status</label>
            <select
              className="rounded-md p-2 bg-cookie-lightcream border border-cookie-darkbrown text-cookie-darkbrown"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-cookie-darkbrown font-medium">Resources</label>
          <p className="text-sm text-cookie-darkbrown opacity-80">Add links with a title and description.</p>
          <div className="flex flex-col gap-2">
            {resources.map((r, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-cookie-lightcream border border-cookie-darkbrown rounded-md p-2">
                <input
                  className="rounded-md p-2 bg-cookie-lightcream border border-cookie-darkbrown text-cookie-darkbrown"
                  placeholder="Title"
                  value={r.title || ""}
                  onChange={(e) => {
                    const next = [...resources];
                    next[idx] = { ...next[idx], title: e.target.value };
                    setResources(next);
                  }}
                />
                <input
                  className="rounded-md p-2 bg-cookie-lightcream border border-cookie-darkbrown text-cookie-darkbrown"
                  placeholder="Link (https://...)"
                  value={r.url || ""}
                  onChange={(e) => {
                    const next = [...resources];
                    next[idx] = { ...next[idx], url: e.target.value };
                    setResources(next);
                  }}
                />
                <div className="flex gap-2">
                  <input
                    className="flex-1 rounded-md p-2 bg-cookie-lightcream border border-cookie-darkbrown text-cookie-darkbrown"
                    placeholder="Short description"
                    value={r.description || ""}
                    onChange={(e) => {
                      const next = [...resources];
                      next[idx] = { ...next[idx], description: e.target.value };
                      setResources(next);
                    }}
                  />
                  <button
                    type="button"
                    className="btn bg-cookie-lightorange text-cookie-darkbrown border border-cookie-darkbrown"
                    onClick={() => setResources(resources.filter((_, i) => i !== idx))}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown w-fit"
              onClick={() => setResources([...resources, { title: "", url: "", description: "" }])}
            >
              Add Resource
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-cookie-darkbrown font-medium">Additional Notes</label>
          <textarea
            className="rounded-md p-2 bg-cookie-lightcream border border-cookie-darkbrown text-cookie-darkbrown min-h-24"
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Any extra information for students"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-cookie-darkbrown font-medium">Prerequisites</label>
          {prereqOptions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {prereqOptions.map((l) => (
                <label
                  key={l.id}
                  className="flex items-center gap-2 bg-cookie-lightcream border border-cookie-darkbrown rounded-md p-2 text-cookie-darkbrown"
                >
                  <input
                    type="checkbox"
                    checked={prerequisites.includes(l.id)}
                    onChange={() => onTogglePrereq(l.id)}
                  />
                  <span className="truncate">{l.title}</span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-cookie-darkbrown opacity-80 text-sm">
              No other lessons to set as prerequisites.
            </p>
          )}
        </div>

        <div className="pt-2 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <Link
            to={`/lesson/course/${courseid}/${lessonid}`}
            className="btn border border-cookie-darkbrown"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default EditLesson;


