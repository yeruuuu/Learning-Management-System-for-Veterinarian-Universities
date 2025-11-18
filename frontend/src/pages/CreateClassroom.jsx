import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router";
import api from "../api";
import toast from "react-hot-toast";
import { RoleContext } from "../contexts/RoleContext";
import { ArrowLeft } from "lucide-react";

const DURATION_OPTIONS = [
  { value: 2, label: "2 weeks" },
  { value: 3, label: "3 weeks" },
  { value: 4, label: "4 weeks" }
];

export default function CreateClassroom() {
  const navigate = useNavigate();
  const { courseid } = useParams();
  const { role } = useContext(RoleContext);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState(20);
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [frequency, setFrequency] = useState(1);
  const [durationWeeks, setDurationWeeks] = useState(2);
  const [courseTitle, setCourseTitle] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      if (!courseid) return;
      try {
        const res = await api.get(`/api/courses/${courseid}/`);
        setCourseTitle(res?.data?.title || "");
      } catch {}
    };
    bootstrap();
  }, [courseid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        capacity: parseInt(capacity) || 20,
        location: location.trim() || undefined,
        frequency: parseInt(frequency) || 1,
        duration_weeks: parseInt(durationWeeks) || 2,
        course: courseid ? parseInt(courseid) : undefined
      };

      if (startDate) {
        payload.class_start_date = startDate;
      }
      if (endDate) {
        payload.class_end_date = endDate;
      }
      if (startTime) {
        payload.class_start_time = startTime;
      }
      if (endTime) {
        payload.class_end_time = endTime;
      }

      Object.keys(payload).forEach((k) => {
        if (payload[k] === undefined) {
          delete payload[k];
        }
      });

      console.log("Creating classroom with payload:", payload);

      let res;
      try {
        res = await api.post(
          "/api/classrooms/teacher/classrooms/create/",
          payload
        );
      } catch (err) {
        console.log("Teacher endpoint failed, trying general endpoint");
        res = await api.post("/api/classrooms/create/", payload);
      }

      console.log("Classroom created response:", res.data);
      toast.success("Classroom created successfully!");

      const id = res?.data?.id ?? res?.data?.pk;
      if (id) {
        navigate(`/classroom/course/${courseid}/${id}`);
      } else {
        navigate(`/classroom/course/${courseid}`);
      }
    } catch (err) {
      console.error("Create failed", err);
      console.error("Error response:", err?.response?.data);
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create classroom";
      toast.error(String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-6 pt-8 bg-cookie-cream">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown rounded-md px-4 py-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-xl bg-cookie-lightcream rounded-lg shadow-md p-8">
          <h2 className="text-center text-2xl font-bold mb-6 text-cookie-darkbrown">
            Create Classroom{courseTitle ? ` for ${courseTitle}` : ""}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-cookie-darkbrown mb-1">
                Title *
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Classroom title"
                required
                className="w-full rounded-md p-3 border border-cookie-darkbrown bg-white text-cookie-darkbrown focus:outline-none focus:ring-2 focus:ring-cookie-darkbrown"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cookie-darkbrown mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Classroom description"
                className="w-full rounded-md p-3 border border-cookie-darkbrown bg-white text-cookie-darkbrown min-h-[120px] focus:outline-none focus:ring-2 focus:ring-cookie-darkbrown"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-cookie-darkbrown mb-1">
                  Capacity *
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  required
                  className="w-full rounded-md p-3 border border-cookie-darkbrown bg-white text-cookie-darkbrown focus:outline-none focus:ring-2 focus:ring-cookie-darkbrown"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cookie-darkbrown mb-1">
                  Location
                </label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Physical or virtual location"
                  className="w-full rounded-md p-3 border border-cookie-darkbrown bg-white text-cookie-darkbrown focus:outline-none focus:ring-2 focus:ring-cookie-darkbrown"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cookie-darkbrown mb-1">
                  Frequency (per week) *
                </label>
                <input
                  type="number"
                  min={1}
                  max={7}
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  required
                  className="w-full rounded-md p-3 border border-cookie-darkbrown bg-white text-cookie-darkbrown focus:outline-none focus:ring-2 focus:ring-cookie-darkbrown"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-cookie-darkbrown mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full rounded-md p-2 border border-cookie-darkbrown bg-white text-cookie-darkbrown focus:outline-none focus:ring-2 focus:ring-cookie-darkbrown"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cookie-darkbrown mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full rounded-md p-2 border border-cookie-darkbrown bg-white text-cookie-darkbrown focus:outline-none focus:ring-2 focus:ring-cookie-darkbrown"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-cookie-darkbrown mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-md p-2 border border-cookie-darkbrown bg-white text-cookie-darkbrown focus:outline-none focus:ring-2 focus:ring-cookie-darkbrown"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cookie-darkbrown mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-md p-2 border border-cookie-darkbrown bg-white text-cookie-darkbrown focus:outline-none focus:ring-2 focus:ring-cookie-darkbrown"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-cookie-darkbrown mb-1">
                Duration (weeks) *
              </label>
              <select
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(e.target.value)}
                required
                className="w-full rounded-md p-2 border border-cookie-darkbrown bg-white text-cookie-darkbrown focus:outline-none focus:ring-2 focus:ring-cookie-darkbrown"
              >
                {DURATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-cookie-darkbrown text-cookie-white py-3 font-semibold hover:bg-cookie-darkbrown/90 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Classroom"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
