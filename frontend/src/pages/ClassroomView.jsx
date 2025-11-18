import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import toast from "react-hot-toast";
import { RoleContext } from "../contexts/RoleContext";
import { EnrolClassroomButton } from "./EnrolClassroom";

const normalizeClassroom = (c = {}) => {
  if (!c || typeof c !== "object") return { id: null, title: "", description: "" };

  const id = c.id ?? c.pk ?? c._id ?? (c.classroom && (c.classroom.id ?? c.classroom.pk)) ?? null;

  const titleCandidates = [
    c.title,
    c.name,
    c.display_name,
    c.classroom?.title,
    c.classroom?.name,
    c.meta?.title,
    c.attributes?.title,
    c.short_name,
    c.label,
    c.classroom_name,
    c.data?.title,
  ];
  const title = (titleCandidates.find((v) => v !== undefined && v !== null && String(v).trim() !== "") ?? `Classroom ${id ?? ""}`).toString();

  const descCandidates = [
    c.description,
    c.desc,
    c.short_description,
    c.summary,
    c.details,
    c.description_text,
    c.description_html,
    c.classroom?.description,
    c.classroom_description,
    c.data?.description,
  ];
  let description = descCandidates.find((v) => v !== undefined && v !== null && String(v).trim() !== "");
  if (!description) description = "";

  if (typeof description === "string" && /<\/?[a-z][\s\S]*>/i.test(description)) {
    description = description.replace(/<\/?[^>]+(>|$)/g, "").trim();
  }

  return { id, title, description };
};

const ClassroomView = () => {
  const { classroomId } = useParams();
  const navigate = useNavigate();
  const { role } = useContext(RoleContext);

  let user = null;
  try {
    const raw = localStorage.getItem("user") ?? null;
    if (raw) user = JSON.parse(raw);
  } catch (e) {
    user = null;
  }
  if (!user) user = { id: null, role: role ?? undefined };
  else if (!user.role) user.role = role ?? user.role;

  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    if (classroom) {
      setEditTitle(classroom.title ?? "");
      setEditDescription(classroom.description ?? "");
    }
  }, [classroom]);

  useEffect(() => {
    if (!classroomId) return;
    setLoading(true);
    setError("");

    (async () => {
      const detailCandidates = [
        `/api/classrooms/teacher/classrooms/${classroomId}/`,
        `/api/classrooms/${classroomId}/`,
        `/api/classrooms/student/classrooms/${classroomId}/`,
      ];

      let got = null;
      for (const ep of detailCandidates) {
        try {
          const res = await fetch(ep, { credentials: "include" });
          const contentType = (res.headers.get("content-type") || "").toLowerCase();
          const text = await res.text();
          if (res.ok && contentType.includes("application/json")) {
            try {
              const data = JSON.parse(text);
              if (data && typeof data === "object") {
                got = data;
                break;
              }
            } catch {
            }
          }
          if (!res.ok) {
            const short = typeof text === "string" ? text.slice(0, 2000) : String(text);
            setError(`Detail endpoint ${ep} returned ${res.status}: ${res.statusText} — server: ${short}`);
            continue;
          }
        } catch (err) {
          console.warn("Detail candidate failed", ep, err);
          continue;
        }
      }

      if (!got) {
        try {
          const listRes = await fetch(`/api/classrooms/student/classrooms/`, { credentials: "include" });
          const contentType = listRes.headers.get("content-type") || "";
          if (listRes.ok && contentType.includes("application/json")) {
            const listData = await listRes.json();
            const arr = Array.isArray(listData) ? listData : Array.isArray(listData.results) ? listData.results : [];
            const found = arr.find((c) => String(c.id ?? c.pk) === String(classroomId));
            if (found) got = found;
          } else {
            const text = await listRes.text().catch(() => "");
            setError(`Student list returned ${listRes.status}. Server: ${String(text).slice(0, 2000)}`);
          }
        } catch (err) {
          // ignore
        }
      }

      if (got) setClassroom(got);
      else setError(`Classroom not found (tried teacher detail, generic detail and student list)`);
      setLoading(false);
    })();
  }, [classroomId]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!classroom) return <div className="p-6">Classroom not found</div>;

  const studentsList = classroom.students ?? classroom.enrolled_students ?? [];
  const initiallyEnrolled = user && studentsList.some((s) => {
    if (!s) return false;
    const id = s.id ?? s.pk ?? s;
    return String(id) === String(user.id);
  });

  const isAssignedTeacher = () => {
    if (!classroom) return false;
    const tid = classroom.teacher_id ?? classroom.teacher?.id ?? classroom.teacher;
    return tid != null && String(tid) === String(user.id) && String(user.role).toLowerCase() === "teacher";
  };

  const handleSaveEdit = async () => {
    try {
      const payload = {
        title: editTitle,
        description: editDescription,
      };
      const res = await api.patch(
        `/api/classrooms/teacher/classrooms/${classroom.id ?? classroom.pk}/`,
        payload,
        { withCredentials: true }
      );
      setClassroom(res.data);
      setEditMode(false);
      toast.success("Saved");
    } catch (err) {
      console.error("Save failed", err);
      const msg = err?.response?.data?.detail || err?.response?.data || err?.message || "Failed to save";
      toast.error(String(msg));
    }
  };

  const norm = normalizeClassroom(classroom);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn">Back</button>
        {isAssignedTeacher() && !editMode && (
          <button onClick={() => setEditMode(true)} className="ml-2 btn btn-secondary">
            Edit
          </button>
        )}
      </div>

      <div className="bg-white p-6 rounded shadow">
        {editMode ? (
          <>
            <label className="block">
              <div className="text-sm font-medium">Title</div>
              <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full border p-2 rounded" />
            </label>
            <label className="block mt-3">
              <div className="text-sm font-medium">Description</div>
              <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full border p-2 rounded" />
            </label>
            <div className="mt-4 flex gap-2">
              <button onClick={handleSaveEdit} className="btn btn-primary">Save</button>
              <button onClick={() => { setEditMode(false); setEditTitle(classroom.title ?? ""); setEditDescription(classroom.description ?? ""); }} className="btn btn-secondary">Cancel</button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold">{norm.title || `Classroom ${norm.id ?? ""}`}</h1>
            <p className="mt-2 text-sm text-gray-600">{norm.description || "No description"}</p>

            <div className="mt-4">
              <strong>Location:</strong> {classroom.location ?? classroom.venue ?? "location"}
            </div>
            <div className="mt-1">
              <strong>Capacity:</strong> {classroom.capacity ?? classroom.seats ?? "—"}
            </div>

            <div className="mt-6">
              <EnrolClassroomButton
                classroomId={classroom.id ?? classroom.pk ?? classroomId}
                initiallyEnrolled={initiallyEnrolled}
                skipPrerequisite={true}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ClassroomView;