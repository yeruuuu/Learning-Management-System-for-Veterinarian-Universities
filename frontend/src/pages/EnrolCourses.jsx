import { useState, useEffect, useContext, useMemo } from "react";
import toast from "react-hot-toast";
import api from "../api";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { ViewContext } from "../contexts/ViewContext";
import ViewToggle from "../components/ViewToggle";
import SearchBar from "../components/SearchBar";

const EnrolCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/courses/available/");
      setCourses(res.data || []);
    } catch (err) {
      console.error("Full error object:", err);
      console.error("Error response:", err.response);
      toast.error("Failed to get courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleEnrol = async (id) => {
    try {
      const res = await api.post("/api/courses/enrollments/create/", {
        course: id
      });
      toast.success(res.status === 201 ? "Enrolled!" : "Already enrolled");
      await fetchCourses(); // refresh list after enrolling
    } catch (error) {
      const status = error?.response?.status;
      if (status === 403) toast.error("You are not allowed to enroll");
      else if (status === 404) toast.error("Course not found");
      else toast.error("Failed to enroll");
    }
  };

  const filteredCourses = useMemo(() => {
    if (!searchQuery) return courses;
    const query = searchQuery.toLowerCase();
    return courses.filter(
      (course) =>
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query)
    );
  }, [courses, searchQuery]);

  return (
    <div className="min-h-screen">
      <div className="ml-4 flex items-center justify-between pr-4">
        <div>
          <Link
            to={"/"}
            className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown"
          >
            <ArrowLeft className="size-5" />
            Back
          </Link>
        </div>
        <div>
          <ViewToggle />
        </div>
      </div>

      <div className="px-4 mt-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search courses by title..."
        />
      </div>

      <div className="mt-6 px-4">
        <ViewContext.Consumer>
          {({ view }) =>
            filteredCourses.length > 0 ? (
              view === "grid" ? (
                <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredCourses.map((course) => (
                    <li
                      key={course.id}
                      className="rounded-xl p-4 shadow bg-cookie-lightcream"
                    >
                      <h3 className="font-semibold text-cookie-darkbrown">
                        {course.title}
                      </h3>
                      <p className="text-sm opacity-80 text-cookie-darkbrown">
                        {course.description}
                      </p>
                      <button
                        className="mt-3 px-3 py-1 rounded bg-cookie-darkbrown text-cookie-white"
                        onClick={() => handleEnrol(course.id)}
                      >
                        Enrol
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="space-y-2">
                  {filteredCourses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center gap-2 p-2 bg-cookie-lightcream rounded-md shadow-sm"
                    >
                      <div className="w-14 h-10 bg-cookie-lightorange rounded-md flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-cookie-darkbrown text-base truncate">
                          {course.title}
                        </h3>
                        <p className="text-xs text-cookie-darkbrown opacity-80 line-clamp-2">
                          {course.description}
                        </p>
                      </div>
                      <div>
                        <button
                          className="px-2 py-1 rounded bg-cookie-darkbrown text-cookie-white text-xs"
                          onClick={() => handleEnrol(course.id)}
                        >
                          Enrol
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="col-span-full flex justify-center items-center min-h-64">
                <p className="text-cookie-darkbrown text-2xl">
                  {courses.length === 0
                    ? "There are no available courses"
                    : "No courses match your search"}
                </p>
              </div>
            )
          }
        </ViewContext.Consumer>
      </div>
    </div>
  );
};
export default EnrolCourses;
