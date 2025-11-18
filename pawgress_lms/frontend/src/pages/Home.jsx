import { useContext, useEffect, useState, useMemo } from "react";
import { RoleContext } from "../contexts/RoleContext";
import CourseCard from "../components/CourseCard";
import { ViewContext } from "../contexts/ViewContext";
import ViewToggle from "../components/ViewToggle";
import SearchBar from "../components/SearchBar";
import toast from "react-hot-toast";
import { PlusIcon } from "lucide-react";
import { Link } from "react-router";
import api from "../api";

const Home = () => {
  const { role, setRole } = useContext(RoleContext);
  const [courses, setCourses] = useState([]);
  const [archivedCourses, setArchivedCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const fetchCourses = async () => {
    try {
      const [activeCourses, archived] = await Promise.all([
        api.get("/api/courses/"),
        api.get("/api/courses/archived/")
      ]);
      setCourses(activeCourses.data);
      setArchivedCourses(archived.data);
    } catch (error) {
      toast.error("Failed to get your courses");
      return;
    }
  };

  useEffect(() => {
    if (role !== "admin") {
      fetchCourses();
    }
  }, []);

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
    <div className="min-h-screen pb-12">
      {role === "admin" ? (
        <>
          <h2 className="font-bold text-3xl pl-8 pt-2">Admin Dashboard</h2>
          <div className="mt-60 flex items-center justify-center">
            <div className="flex gap-8">
              <Link
                to={"/users"}
                className="bg-cookie-darkbrown rounded-md text-cookie-white p-9"
              >
                Users
              </Link>
              <Link
                to={"/ban/students"}
                className="bg-cookie-darkbrown rounded-md text-cookie-white p-9"
              >
                Manage Students
              </Link>
              <Link
                to={"/approve/teachers"}
                className="bg-cookie-darkbrown rounded-md text-cookie-white p-9"
              >
                Manage Teachers
              </Link>
              <Link
                to={"/reports"}
                className="bg-cookie-darkbrown rounded-md text-cookie-white p-9"
              >
                Reports
              </Link>
            </div>
          </div>
        </>
      ) : (
        <>
          <h2 className="font-bold text-3xl pl-8 pt-2">My Courses</h2>
          <div className="pl-8 pt-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex justify-start gap-2">
                <div className="flex items-center gap-4">
                  <Link
                    to={"/course/enroll"}
                    className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown"
                  >
                    <PlusIcon className="size-5" />
                    Enrol Courses
                  </Link>
                </div>
                {role === "student" && (
                  <div className="flex items-center gap-4">
                    <Link
                      to={"/grades"}
                      className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown"
                    >
                      My Grades
                    </Link>
                  </div>
                )}
                {role === "teacher" && (
                  <div className="flex items-center gap-4">
                    <Link
                      to={"/course/create"}
                      className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown"
                    >
                      <PlusIcon className="size-5" />
                      Create Course
                    </Link>
                  </div>
                )}
              </div>
              <div className="pr-8">
                <ViewToggle />
              </div>
            </div>
            <div className="pr-8">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search your courses..."
              />
            </div>
          </div>

          <div className="mx-auto mt-8">
            <div className="max-w-full mx-4 px-4">
              {/* Active Courses Section */}
              {filteredCourses.length > 0 ? (
                <ViewContext.Consumer>
                  {({ view }) =>
                    view === "grid" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-16">
                        {filteredCourses.map((course) => (
                          <CourseCard
                            key={course.id}
                            courseId={course.id}
                            courseTitle={course.title}
                            courseDescription={course.description}
                            view={view}
                            isArchived={false}
                            onArchiveToggle={fetchCourses}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredCourses.map((course) => (
                          <CourseCard
                            key={course.id}
                            courseId={course.id}
                            courseTitle={course.title}
                            courseDescription={course.description}
                            view={view}
                            isArchived={false}
                            onArchiveToggle={fetchCourses}
                          />
                        ))}
                      </div>
                    )
                  }
                </ViewContext.Consumer>
              ) : (
                <div className="col-span-full flex justify-center items-center min-h-64">
                  <p className="text-cookie-darkbrown text-2xl">
                    {courses.length === 0
                      ? "You haven't enrolled in any courses"
                      : "No courses match your search"}
                  </p>
                </div>
              )}

              {/* Archived Courses Section */}
              {archivedCourses.length > 0 && (
                <div className="mt-12">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-cookie-darkbrown">
                      Archived Courses ({archivedCourses.length})
                    </h3>
                    <button
                      onClick={() => setShowArchived(!showArchived)}
                      className="btn btn-sm bg-cookie-darkbrown text-cookie-white border-cookie-darkbrown"
                    >
                      {showArchived ? "Hide" : "Show"}
                    </button>
                  </div>

                  {showArchived && (
                    <ViewContext.Consumer>
                      {({ view }) =>
                        view === "grid" ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-16">
                            {archivedCourses.map((course) => (
                              <CourseCard
                                key={course.id}
                                courseId={course.id}
                                courseTitle={course.title}
                                courseDescription={course.description}
                                view="grid"
                                isArchived={true}
                                onArchiveToggle={fetchCourses}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {archivedCourses.map((course) => (
                              <CourseCard
                                key={course.id}
                                courseId={course.id}
                                courseTitle={course.title}
                                courseDescription={course.description}
                                view={view}
                                isArchived={true}
                                onArchiveToggle={fetchCourses}
                              />
                            ))}
                          </div>
                        )
                      }
                    </ViewContext.Consumer>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default Home;
