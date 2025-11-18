import React, { useState, useEffect, useContext, useMemo } from "react";
import toast from "react-hot-toast";
import api from "../api";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { ViewContext } from "../contexts/ViewContext";
import ViewToggle from "../components/ViewToggle";
import SearchBar from "../components/SearchBar";
import { RoleContext } from "../contexts/RoleContext";

export const EnrolClassroomButton = ({ classroomId, initiallyEnrolled = false, onChange, skipPrerequisite = false }) => {
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

  const [loading, setLoading] = useState(false);
  const [enrolled, setEnrolled] = useState(Boolean(initiallyEnrolled));
  const isStudent = user && String(user.role).toLowerCase() === "student";
  if (!isStudent) return null;

  const handleEnroll = async () => {
    setLoading(true);
    try {
      const res = await api.post(
        `/api/classrooms/student/classrooms/${classroomId}/enroll/`,
        { skip_prerequisite: Boolean(skipPrerequisite) },
        { withCredentials: true }
      );
      setEnrolled(true);
      onChange?.(true);
      toast.success("Enrolled");
    } catch (err) {
      const data = err?.response?.data;
      const msg = (data && (data.detail || data.error || JSON.stringify(data))) || err.message || "Failed to enroll";
      console.error("Enroll failed:", err);
      toast.error(msg);
      onChange?.(false);
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async () => {
    setLoading(true);
    try {
      await api.post(`/api/classrooms/student/classrooms/${classroomId}/unenroll/`, {}, { withCredentials: true });
      setEnrolled(false);
      onChange?.(false);
      toast.success("Unenrolled");
    } catch (err) {
      const data = err?.response?.data;
      const msg = (data && (data.detail || data.error || JSON.stringify(data))) || err.message || "Failed to unenroll";
      console.error("Unenroll failed:", err);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return enrolled ? (
    <button onClick={handleUnenroll} disabled={loading} className="px-3 py-1 rounded bg-cookie-cream border border-cookie-darkbrown text-cookie-darkbrown">
      {loading ? "Processing…" : "Withdraw"}
    </button>
  ) : (
    <button onClick={handleEnroll} disabled={loading} className="px-3 py-1 rounded bg-cookie-darkbrown text-cookie-white">
      {loading ? "Processing…" : "Enrol"}
    </button>
  );
};

const EnrolClassrooms = ({ courseId = null }) => {
  const { role } = useContext(RoleContext);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debug, setDebug] = useState([]);

  const fetchClassrooms = async () => {
    setLoading(true);
    try {
      let got = [];
      const tried = [];

      const endpoints = [];
      if (courseId) {
        endpoints.push(
          `/api/classrooms/student/classrooms/available/?course=${courseId}`,
          `/api/classrooms/student/classrooms/?course=${courseId}`
        );
      }
      endpoints.push(
        "/api/classrooms/student/classrooms/available/",
        "/api/classrooms/student/classrooms/",
        `/api/classrooms/?course=${courseId || ""}`,
        "/api/classrooms/"
      );

      for (const ep of endpoints) {
        try {
          const res = await api.get(ep, { withCredentials: true });
          tried.push({ endpoint: ep, status: res.status, data: res.data });
          const data = res?.data;
          if (Array.isArray(data) && data.length > 0) {
            got = data;
            break;
          }
          if (data && Array.isArray(data.results) && data.results.length > 0) {
            got = data.results;
            break;
          }
          if (data && typeof data === "object" && !Array.isArray(data)) {
            const keys = Object.keys(data);
            const looksLikeApiRoot = keys.some((k) => k.includes("student") || k.includes("teacher"));
            if (looksLikeApiRoot) continue;
          }
        } catch (e) {
          tried.push({ endpoint: ep, status: e?.response?.status ?? "ERR", error: e?.response?.data ?? e.message });
        }
      }

      setDebug(tried);

      const uniq = [];
      const seen = new Set();
      for (const c of got) {
        const id = c.id ?? c.pk ?? c._id ?? JSON.stringify(c);
        if (!seen.has(id)) {
          seen.add(id);
          uniq.push(c);
        }
      }
      setClassrooms(uniq);
    } catch (err) {
      console.error("Full error object:", err);
      toast.error("Failed to get classrooms");
      setClassrooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, [courseId]);

  const handleEnrol = (id, cls, enrolled) => {
    if (!enrolled) {
      toast.error("Enrollment did not complete");
      return;
    }

    if (String(role ?? "").toLowerCase() === "teacher") {
      toast.success("Enrolled (teacher) — classroom retained in list");
      return;
    }

    const courseKey = courseId ?? cls?.course ?? cls?.course_id ?? cls?.course?.id;
    if (courseKey) {
      setClassrooms((prev) =>
        prev.filter((c) => {
          const cid = c.course ?? c.course_id ?? c.course?.id;
          return String(cid) !== String(courseKey);
        })
      );
    } else {
      setClassrooms((prev) => prev.filter((c) => String(c.id ?? c.pk) !== String(id)));
    }
  };

  const filtered = useMemo(() => {
    if (!searchQuery) return classrooms;
    const q = searchQuery.toLowerCase();
    return classrooms.filter(
      (c) =>
        (c.title || c.name || "").toLowerCase().includes(q) ||
        (c.description || c.desc || "").toLowerCase().includes(q) ||
        (c.location || c.venue || "").toLowerCase().includes(q)
    );
  }, [classrooms, searchQuery]);

  const fmt = (c) => {
    const id = c.id ?? c.pk ?? c._id;
    const titleCandidates = [
      c.title,
      c.name,
      c.display_name,
      c.classroom?.title,
      c.classroom?.name,
      c.meta?.title,
      c.attributes?.title,
      c.short_name,
    ];
    const title = titleCandidates.find((v) => v !== undefined && v !== null && String(v).trim() !== "") ?? `Classroom ${id}`;

    const descCandidates = [
      c.description,
      c.desc,
      c.short_description,
      c.summary,
      c.details,
      c.description_text,
      c.description_html,
      c.classroom?.description,
    ];
    let description = descCandidates.find((v) => v !== undefined && v !== null && String(v).trim() !== "");
    if (!description) description = "No description";
    if (typeof description === "string" && /<\/?[a-z][\s\S]*>/i.test(description)) {
      description = description.replace(/<\/?[^>]+(>|$)/g, "").trim();
    }

    const location = c.location ?? c.venue ?? c.room ?? c.classroom?.location ?? "TBA";
    const capacity = c.capacity ?? c.seats ?? c.max_capacity ?? c.classroom?.capacity ?? "—";
    const teacher =
      c.teacher_name ??
      c.teacher?.full_name ??
      c.teacher?.name ??
      (typeof c.teacher === "string" ? c.teacher : c.teacher ?? "—");

    const start = c.start_date ?? c.start ?? c.begin_date ?? c.classroom?.start_date ?? null;
    const end = c.end_date ?? c.end ?? c.finish_date ?? c.classroom?.end_date ?? null;
    const startStr = start ? new Date(start).toLocaleDateString() : "TBA";
    const endStr = end ? new Date(end).toLocaleDateString() : "TBA";

    return { id, title, description, location, capacity, teacher, startStr, endStr };
  };

  return (
    <div className="min-h-screen">
      <div className="ml-4 flex items-center justify-between pr-4">
        <div>
          <Link to={"/"} className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown">
            <ArrowLeft className="size-5" />
            Back
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {String(role ?? "").toLowerCase() === "teacher" && (
            <Link
              to="/classrooms/create"
              className="btn bg-cookie-cream text-cookie-darkbrown border border-cookie-darkbrown"
            >
              New Classroom
            </Link>
          )}
          <ViewToggle />
        </div>
      </div>

      <div className="px-4 mt-6">
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search classrooms by title, description or location..." />
      </div>

      <div className="mt-6 px-4">
        <ViewContext.Consumer>
          {({ view }) =>
            filtered.length > 0 ? (
              view === "grid" ? (
                <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((cls) => {
                    const d = fmt(cls);
                    return (
                      <li key={d.id} className="rounded-xl p-4 shadow bg-cookie-lightcream">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-cookie-darkbrown">{d.title}</h3>
                            <p className="text-sm opacity-80 text-cookie-darkbrown mt-1">{d.description}</p>
                            <div className="text-xs text-cookie-darkbrown mt-2 flex gap-4">
                              <span>Location: {d.location}</span>
                              <span>Capacity: {d.capacity}</span>
                              <span>Teacher: {d.teacher}</span>
                            </div>
                            <div className="text-xs text-cookie-darkbrown mt-1">Dates: {d.startStr} — {d.endStr}</div>
                          </div>
                          <div className="mt-1 flex flex-col items-end gap-2">
                            <EnrolClassroomButton
                              classroomId={d.id}
                              onChange={(enrolled) => {
                                if (enrolled) {
                                  /* handled in parent */
                                }
                              }}
                              skipPrerequisite={true}
                            />
                            <Link
                              to={`/classrooms/${d.id}`}
                              className="px-3 py-1 rounded border border-cookie-darkbrown text-cookie-darkbrown bg-cookie-cream"
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="space-y-2">
                  {filtered.map((cls) => {
                    const d = fmt(cls);
                    return (
                      <div key={d.id} className="flex items-center gap-2 p-2 bg-cookie-lightcream rounded-md shadow-sm">
                        <div className="w-14 h-10 bg-cookie-lightorange rounded-md flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-cookie-darkbrown text-base truncate">{d.title}</h3>
                          <p className="text-xs text-cookie-darkbrown opacity-80 line-clamp-2">{d.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <EnrolClassroomButton
                            classroomId={d.id}
                            onChange={(enrolled) => handleEnrol(d.id, cls, enrolled)}
                            skipPrerequisite={true}
                          />
                          <Link to={`/classrooms/${d.id}`} className="px-2 py-1 rounded border border-cookie-darkbrown text-cookie-darkbrown text-xs bg-cookie-cream">
                            View
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <div className="col-span-full flex justify-center items-center min-h-64">
                <p className="text-cookie-darkbrown text-2xl">{classrooms.length === 0 ? "There are no available classrooms" : "No classrooms match your search"}</p>
              </div>
            )
          }
        </ViewContext.Consumer>
      </div>

      {!loading && classrooms.length === 0 && (
        <div className="mx-4 mt-6 p-4 bg-white rounded shadow-sm text-xs">
          <strong>Debug — endpoints tried:</strong>
          <ul className="mt-2 list-disc ml-5">
            {debug.length === 0 ? (
              <li>No attempts recorded</li>
            ) : (
              debug.map((d, i) => (
                <li key={i}>
                  <div><code>{d.endpoint}</code> — status: {String(d.status)}</div>
                  {d.data && <pre className="mt-1 overflow-auto max-h-32">{JSON.stringify(d.data, null, 2)}</pre>}
                  {d.error && <div className="text-red-600">error: {typeof d.error === "string" ? d.error : JSON.stringify(d.error)}</div>}
                </li>
              ))
            )}
          </ul>
          <div className="mt-2 text-gray-600">Check Network tab / console for full response headers.</div>
        </div>
      )}
    </div>
  );
};

export default EnrolClassrooms;