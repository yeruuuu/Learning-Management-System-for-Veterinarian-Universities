import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { RoleContext } from "../contexts/RoleContext";
import api from "../api";
import toast from "react-hot-toast";
import { ArrowLeft, Save } from "lucide-react";

const EditClassroom = () => {
  const [classroom, setClassroom] = useState({
    title: "",
    description: "",
    capacity: "",
    location: "",
    frequency: "",
    duration_weeks: "",
    class_start_date: "",
    class_end_date: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { id, courseid } = useParams();
  const { role } = useContext(RoleContext);
  const navigate = useNavigate();

  const isTeacher = (role || "").toLowerCase() === "teacher";

  useEffect(() => {
    if (!isTeacher) {
      navigate("/classrooms");
      return;
    }

    const fetchClassroom = async () => {
      try {
        setLoading(true);
        const response = await api.get(
          `/api/classrooms/teacher/classrooms/${id}/`
        );
        setClassroom(response.data);
      } catch (err) {
        console.error("Failed to fetch classroom:", err);
        toast.error("Failed to load classroom details");
        if (err?.response?.status === 404) {
          navigate("/classrooms");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchClassroom();
    }
  }, [id, isTeacher, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClassroom((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    try {
      await api.put(`/api/classrooms/teacher/classrooms/${id}/`, classroom);
      toast.success("Classroom updated successfully");
      navigate(`/classrooms/${id}`);
    } catch (err) {
      console.error("Failed to update classroom:", err);
      const msg = err?.response?.data?.detail || "Failed to update classroom";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!isTeacher) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen px-6 pt-8 bg-cookie-cream">
        <div className="text-cookie-darkbrown">
          Loading classroom details...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 pt-8 bg-cookie-cream">
      <div className="mb-6">
        <Link
          to={`/classroom/course/${courseid}/${id}`}
          className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown"
        >
          <ArrowLeft className="size-5" /> Back to Classroom Details
        </Link>
      </div>

      <div className="max-w-2xl mx-auto bg-cookie-lightcream rounded-lg shadow-lg overflow-hidden">
        {/* Header Section */}
        <div className="bg-cookie-lightorange p-6">
          <h1 className="text-2xl font-bold text-cookie-darkbrown">
            Edit Classroom
          </h1>
          <p className="text-cookie-darkbrown mt-2">
            Update your classroom information
          </p>
        </div>

        {/* Form Section */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-cookie-darkbrown mb-2"
              >
                Classroom Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={classroom.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-cookie-lightorange rounded-md focus:outline-none focus:ring-2 focus:ring-cookie-darkbrown bg-cookie-cream text-cookie-darkbrown"
                placeholder="Enter classroom title"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-cookie-darkbrown mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={classroom.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-cookie-lightorange rounded-md focus:outline-none focus:ring-2 focus:ring-cookie-darkbrown bg-cookie-cream text-cookie-darkbrown"
                placeholder="Enter classroom description"
              />
            </div>

            {/* Capacity and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="capacity"
                  className="block text-sm font-medium text-cookie-darkbrown mb-2"
                >
                  Capacity *
                </label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={classroom.capacity}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-cookie-lightorange rounded-md focus:outline-none focus:ring-2 focus:ring-cookie-darkbrown bg-cookie-cream text-cookie-darkbrown"
                  placeholder="Max students"
                />
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-cookie-darkbrown mb-2"
                >
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={classroom.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-cookie-lightorange rounded-md focus:outline-none focus:ring-2 focus:ring-cookie-darkbrown bg-cookie-cream text-cookie-darkbrown"
                  placeholder="Room number or location"
                />
              </div>
            </div>

            {/* Frequency and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="frequency"
                  className="block text-sm font-medium text-cookie-darkbrown mb-2"
                >
                  Frequency (per week) *
                </label>
                <input
                  type="number"
                  id="frequency"
                  name="frequency"
                  value={classroom.frequency}
                  onChange={handleChange}
                  required
                  min="1"
                  max="7"
                  className="w-full px-3 py-2 border border-cookie-lightorange rounded-md focus:outline-none focus:ring-2 focus:ring-cookie-darkbrown bg-cookie-cream text-cookie-darkbrown"
                  placeholder="Times per week"
                />
              </div>

              <div>
                <label
                  htmlFor="duration_weeks"
                  className="block text-sm font-medium text-cookie-darkbrown mb-2"
                >
                  Duration (weeks) *
                </label>
                <input
                  type="number"
                  id="duration_weeks"
                  name="duration_weeks"
                  value={classroom.duration_weeks}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-cookie-lightorange rounded-md focus:outline-none focus:ring-2 focus:ring-cookie-darkbrown bg-cookie-cream text-cookie-darkbrown"
                  placeholder="Number of weeks"
                />
              </div>
            </div>

            {/* Start and End Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="class_start_date"
                  className="block text-sm font-medium text-cookie-darkbrown mb-2"
                >
                  Start Date
                </label>
                <input
                  type="date"
                  id="class_start_date"
                  name="class_start_date"
                  value={classroom.class_start_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-cookie-lightorange rounded-md focus:outline-none focus:ring-2 focus:ring-cookie-darkbrown bg-cookie-cream text-cookie-darkbrown"
                />
              </div>

              <div>
                <label
                  htmlFor="class_end_date"
                  className="block text-sm font-medium text-cookie-darkbrown mb-2"
                >
                  End Date
                </label>
                <input
                  type="date"
                  id="class_end_date"
                  name="class_end_date"
                  value={classroom.class_end_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-cookie-lightorange rounded-md focus:outline-none focus:ring-2 focus:ring-cookie-darkbrown bg-cookie-cream text-cookie-darkbrown"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown hover:bg-cookie-darkbrown/90 flex-1"
              >
                {saving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="size-4" />
                    Update Classroom
                  </>
                )}
              </button>

              <Link
                to={`/classrooms/${id}`}
                className="btn btn-outline border-cookie-darkbrown text-cookie-darkbrown hover:bg-cookie-darkbrown hover:text-cookie-white"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditClassroom;
