import { useEffect, useMemo, useState, useContext } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
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
  { value: "published", label: "Published" }
];

const CreateLesson = () => {
  const navigate = useNavigate();
  const { courseid } = useParams();
  const { role } = useContext(RoleContext);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [objectives, setObjectives] = useState("");
  const [creditValue, setCreditValue] = useState(1.0);
  const [estimatedDuration, setEstimatedDuration] = useState("1_hour");
  const [status, setStatus] = useState("draft");
  // Resources: structured list serialized to JSON for backend `resources` field
  const [resources, setResources] = useState([]);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [prereqOptions, setPrereqOptions] = useState([]);
  const [prerequisites, setPrerequisites] = useState([]);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseCredits, setCourseCredits] = useState(0);
  const [existingCredits, setExistingCredits] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [courseRes, lessonsRes] = await Promise.all([
          api.get(`/api/courses/${courseid}/`),
          api.get(`/api/lessons/${courseid}/`)
        ]);
        setCourseTitle(courseRes?.data?.title || "");
        setCourseCredits(courseRes?.data?.total_credits ?? 0);
        const list = lessonsRes?.data || [];
        setPrereqOptions(list);
        const sum = list.reduce(
          (acc, l) => acc + (parseFloat(l.credit_value) || 0),
          0
        );
        setExistingCredits(sum);
      } catch (error) {
        // Silent: user can still create
      }
    };
    if (courseid) bootstrap();
  }, [courseid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (role !== "teacher") {
      toast.error("Only teachers can create lessons");
      return;
    }
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    // Prevent creating a lesson that would exceed the course credit points
    const cap = parseFloat(courseCredits) || 0;
    const sumExisting = parseFloat(existingCredits) || 0;
    const newCredit = parseFloat(creditValue) || 0;
    if (cap > 0 && sumExisting + newCredit > cap + 1e-9) {
      toast.error("Credit points exceed course credit points");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      await api.post(`/api/lessons/${courseid}/create/`, {
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
      toast.success("Lesson created");
      navigate(`/lesson/course/${courseid}`);
    } catch (error) {
      toast.error("Failed to create lesson");
    } finally {
      setLoading(false);
    }
  };

  const onTogglePrereq = (id) => {
    setPrerequisites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen">
      <div className="ml-8 mt-2">
        <Link
          to={`/lesson/course/${courseid}`}
          className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown"
        >
          <ArrowLeft className="size-5" />
          Back
        </Link>
      </div>
      <div className="px-8">
        <h2 className="font-bold text-3xl pt-2">
          Create Lesson{courseTitle ? ` for ${courseTitle}` : ""}
        </h2>
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

      <form className="max-w-3xl mx-8 mt-6 space-y-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1">
          <label className="text-cookie-darkbrown font-medium">Title</label>
          <input
            className="rounded-md p-2 bg-cookie-lightcream border border-cookie-darkbrown text-cookie-darkbrown"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Lesson title"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-cookie-darkbrown font-medium">
            Description
          </label>
          <textarea
            className="rounded-md p-2 bg-cookie-lightcream border border-cookie-darkbrown text-cookie-darkbrown min-h-28"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the lesson"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-cookie-darkbrown font-medium">
            Objectives
          </label>
          <textarea
            className="rounded-md p-2 bg-cookie-lightcream border border-cookie-darkbrown text-cookie-darkbrown min-h-24"
            value={objectives}
            onChange={(e) => setObjectives(e.target.value)}
            placeholder="Use new lines for bullet-like objectives"
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
              Remaining after this lesson:{" "}
              {(
                (parseFloat(courseCredits) || 0) -
                (existingCredits + (parseFloat(creditValue) || 0))
              ).toFixed(1)}{" "}
              (Course: {courseCredits}, Existing: {existingCredits}, New:{" "}
              {creditValue})
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-cookie-darkbrown font-medium">
              Duration
            </label>
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
          <p className="text-sm text-cookie-darkbrown opacity-80">
            Add links with a title and description.
          </p>
          <div className="flex flex-col gap-2">
            {resources.map((r, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-cookie-lightcream border border-cookie-darkbrown rounded-md p-2"
              >
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
                    onClick={() =>
                      setResources(resources.filter((_, i) => i !== idx))
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown w-fit"
              onClick={() =>
                setResources([
                  ...resources,
                  { title: "", url: "", description: "" }
                ])
              }
            >
              Add Resource
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-cookie-darkbrown font-medium">
            Additional Notes
          </label>
          <textarea
            className="rounded-md p-2 bg-cookie-lightcream border border-cookie-darkbrown text-cookie-darkbrown min-h-24"
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Any extra information for students"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-cookie-darkbrown font-medium">
            Prerequisites
          </label>
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
              No existing lessons to select as prerequisites.
            </p>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown"
          >
            {loading ? "Creating..." : "Create Lesson"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateLesson;
