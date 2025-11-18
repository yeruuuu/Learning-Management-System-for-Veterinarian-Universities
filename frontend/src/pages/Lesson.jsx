import { useState, useEffect, useContext, useMemo } from "react";
import api from "../api";
import { RoleContext } from "../contexts/RoleContext";
import toast from "react-hot-toast";
import { ArrowLeft, PlusIcon } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import LessonCard from "../components/LessonCard";
import { ViewContext } from "../contexts/ViewContext";
import ViewToggle from "../components/ViewToggle";
import SearchBar from "../components/SearchBar";

const Lesson = () => {
  const [lessons, setLessons] = useState([]);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseCredits, setCourseCredits] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const { role } = useContext(RoleContext);
  const { courseid } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await api.get(`/api/lessons/${courseid}/`);
        setLessons(res.data || []);
      } catch (error) {
        toast.error("Failed to get lessons");
      }
    };
    if (courseid) fetchLessons();
  }, [courseid]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/api/courses/${courseid}/`);
        setCourseTitle(res.data?.title || "");
        setCourseCredits(res.data?.total_credits ?? 0);
      } catch (error) {
        // Non-blocking UI; skip toast here to avoid noise
      }
    };
    if (courseid) fetchCourse();
  }, [courseid]);

  const filteredLessons = useMemo(() => {
    if (!searchQuery) return lessons;
    const q = searchQuery.toLowerCase();
    return (lessons || []).filter(
      (l) =>
        l.title?.toLowerCase().includes(q) ||
        l.description?.toLowerCase().includes(q)
    );
  }, [lessons, searchQuery]);

  const positionById = useMemo(() => {
    // Consistent numbering regardless of search: based on sorted original list by id
    const sorted = [...(lessons || [])].sort((a, b) => (a.id || 0) - (b.id || 0));
    const map = {};
    sorted.forEach((l, i) => (map[l.id] = i + 1));
    return map;
  }, [lessons]);

  return (
    <div className="min-h-screen">
      <div className="ml-8 mt-2">
        <Link
          to={`/course/${courseid}`}
          className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown"
        >
          <ArrowLeft className="size-5" />
          Back
        </Link>
      </div>
      <div className="flex items-center justify-between px-8 pt-2">
        <h2 className="font-bold text-3xl">
          Lessons{courseTitle ? `: ${courseTitle}` : ""}
        </h2>
        <div className="flex items-center gap-3">
          <ViewToggle />
          {role === "teacher" && (
            <Link
              to={`/lesson/create/course/${courseid}`}
              className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown"
            >
              <PlusIcon className="size-5" />
              Create Lesson
            </Link>
          )}
        </div>
      </div>

      <div className="pl-8 pr-8 mt-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search lessons by title..."
        />
      </div>

      <div className="mx-auto mt-8">
        <div className="max-w-full mx-4 px-4">
          <ViewContext.Consumer>
          {({ view }) =>
            filteredLessons.length > 0 ? (
              view === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-16">
                  {filteredLessons.map((l) => (
                    <LessonCard
                      key={l.id}
                      lessonId={l.id}
                      courseId={l.course}
                      lessonTitle={l.title}
                      lessonDescription={l.description}
                      locked={!l.accessible}
                      onClick={() => navigate(`/lesson/course/${courseid}/${l.id}`)}
                      view={view}
                      number={positionById[l.id]}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredLessons.map((l) => (
                    <LessonCard
                      key={l.id}
                      lessonId={l.id}
                      courseId={l.course}
                      lessonTitle={l.title}
                      lessonDescription={l.description}
                      locked={!l.accessible}
                      onClick={() => navigate(`/lesson/course/${courseid}/${l.id}`)}
                      view={view}
                      number={positionById[l.id]}
                    />
                  ))}
                </div>
              )
            ) : (
              <div className="col-span-full flex justify-center items-center min-h-64">
                <p className="text-cookie-darkbrown text-2xl">
                  {lessons.length === 0 ? "No lessons found" : "No lessons match your search"}
                </p>
              </div>
            )
          }
          </ViewContext.Consumer>
        </div>
      </div>
    </div>
  );
};
export default Lesson;
