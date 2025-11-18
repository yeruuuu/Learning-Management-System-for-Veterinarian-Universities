import { useState } from "react";
import toast from "react-hot-toast";
import api from "../api";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

const CreateCourse = () => {
  const [loading, setLoading] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [creditPoints, setCreditPoints] = useState("");

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    const missingFields = [];
    if (!courseName) missingFields.push("Course Name");
    if (!courseDesc) missingFields.push("Course Description");
    if (!creditPoints) missingFields.push("Course Credit Points");

    if (missingFields.length > 0) {
      toast.error(`Please fill out: ${missingFields.join(", ")}`);
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/api/courses/create/", {
        title: courseName,
        description: courseDesc,
        total_credits: parseFloat(creditPoints) || 0
      });
      if (res.status === 201) {
        toast.success("Course successfully created");
      }
      setCourseName("");
      setCourseDesc("");
      setCreditPoints("");
    } catch (error) {
      console.error("Full error object:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      // Show more specific error message
      if (error.response?.data) {
        toast.error(
          `Failed to create course: ${JSON.stringify(error.response.data)}`
        );
      } else {
        toast.error("Failed to create course");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="ml-4">
        <Link
          to={"/"}
          className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown"
        >
          <ArrowLeft className="size-5" />
          Back
        </Link>
      </div>
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-cookie-lightcream rounded-lg shadow-lg p-8 space-y-6">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
            Create New Course
          </h2>
          <div className="space-y-2">
            <label
              htmlFor="courseName"
              className="block text-sm font-medium text-gray-700"
            >
              Course Name
            </label>
            <input
              id="courseName"
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="w-full px-4 py-3 border border-cookie-darkorange rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
              placeholder="Enter course name"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="courseDesc"
              className="block text-sm font-medium text-gray-700"
            >
              Course Description
            </label>
            <textarea
              id="courseDesc"
              value={courseDesc}
              onChange={(e) => setCourseDesc(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-cookie-darkorange rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors resize-vertical"
              placeholder="Enter course description"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="creditPoints"
              className="block text-sm font-medium text-gray-700"
            >
              Credit Points for this course
            </label>
            <input
              id="creditPoints"
              type="number"
              value={creditPoints}
              onChange={(e) => setCreditPoints(e.target.value)}
              className="w-full px-4 py-3 border border-cookie-darkorange rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
              placeholder="Enter credit points"
            />
          </div>
          <div className="pt-4">
            <button
              type="submit"
              onClick={handleSubmit}
              className="w-full bg-cookie-darkorange text-white py-3 px-6 rounded-lg hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors font-medium"
            >
              Create Course
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CreateCourse;
