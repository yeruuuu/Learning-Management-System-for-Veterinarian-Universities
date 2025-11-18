import { useNavigate } from "react-router";
import { useContext } from "react";
import { MoreVertical, Archive, ArchiveRestore, LogOut } from "lucide-react";
import { RoleContext } from "../contexts/RoleContext";
import api from "../api";
import toast from "react-hot-toast";

const CourseCard = ({
  courseId,
  courseTitle,
  courseDescription,
  view = "grid",
  isArchived = false,
  onArchiveToggle
}) => {
  const navigate = useNavigate();
  const { role } = useContext(RoleContext);

  const handleOnClick = () => {
    navigate(`/course/${courseId}`);
  };

  const handleArchiveToggle = async (e) => {
    e.stopPropagation(); // Prevent card click when clicking archive button

    try {
      const res = await api.post(
        `/api/courses/${courseId}/enrollment/archive/`
      );
      toast.success(res.data.message);

      // Call the parent callback to refresh the course list
      if (onArchiveToggle) {
        onArchiveToggle();
      }
    } catch (error) {
      console.error("Error archiving course:", error);
      toast.error(error.response?.data?.error || "Failed to archive course");
    }
  };

  const handleWithdraw = async (e) => {
    e.stopPropagation(); // Prevent card click when clicking withdraw button

    if (
      !window.confirm(
        `Are you sure you want to withdraw from "${courseTitle}"? This will remove the course from your enrolled courses.`
      )
    ) {
      return;
    }

    try {
      const res = await api.delete(`/api/courses/${courseId}/withdraw/`);
      toast.success(res.data.message);

      // Call the parent callback to refresh the course list
      if (onArchiveToggle) {
        onArchiveToggle();
      }
    } catch (error) {
      console.error("Error withdrawing from course:", error);
      toast.error(
        error.response?.data?.error || "Failed to withdraw from course"
      );
    }
  };

  if (view === "list") {
    return (
      <div
        onClick={handleOnClick}
        className="flex items-center gap-4 p-3 bg-cookie-lightcream rounded-md shadow-sm cursor-pointer relative"
      >
        <div className="w-20 h-16 bg-cookie-lightorange rounded-md flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-cookie-darkbrown text-lg whitespace-normal break-words">
            {courseTitle}
          </h3>
          <p className="text-sm text-cookie-darkbrown opacity-80 line-clamp-2">
            {courseDescription}
          </p>
        </div>
        <div className="flex gap-2">
          {role === "student" && !isArchived && (
            <button
              onClick={handleWithdraw}
              className="btn btn-sm btn-ghost text-red-600 hover:bg-red-50"
              title="Withdraw from course"
            >
              <LogOut className="size-5" />
            </button>
          )}
          <button
            onClick={handleArchiveToggle}
            className="btn btn-sm btn-ghost text-cookie-darkbrown"
            title={isArchived ? "Unarchive course" : "Archive course"}
          >
            {isArchived ? (
              <ArchiveRestore className="size-5" />
            ) : (
              <Archive className="size-5" />
            )}
          </button>
        </div>
      </div>
    );
  }

  // Grid view: shorter height with truncated description
  return (
    <div className="w-full cursor-pointer h-40" onClick={handleOnClick}>
      <div className="rounded-xl shadow-xl overflow-hidden h-full flex flex-col">
        <div className="relative bg-cookie-lightorange h-10 w-full flex-shrink-0">
          <div className="absolute right-2 top-1 flex gap-1">
            {role === "student" && !isArchived && (
              <button
                onClick={handleWithdraw}
                className="btn btn-sm btn-ghost text-red-600 hover:bg-red-50"
                title="Withdraw from course"
              >
                <LogOut className="size-5" />
              </button>
            )}
            <button
              onClick={handleArchiveToggle}
              className="btn btn-sm btn-ghost text-cookie-darkbrown"
              title={isArchived ? "Unarchive course" : "Archive course"}
            >
              {isArchived ? (
                <ArchiveRestore className="size-5" />
              ) : (
                <Archive className="size-5" />
              )}
            </button>
          </div>
        </div>
        <div className="bg-cookie-lightcream p-4 flex-1 overflow-hidden">
          <h2 className="font-semibold text-cookie-darkbrown whitespace-normal break-words">
            {courseTitle}
          </h2>
          <p className="text-cookie-darkbrown opacity-90 mt-1 line-clamp-2">
            {courseDescription}
          </p>
        </div>
      </div>
    </div>
  );
};
export default CourseCard;
