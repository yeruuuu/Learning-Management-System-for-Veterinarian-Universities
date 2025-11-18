import { useCallback, useContext, useState } from "react";
import { useNavigate, Link, useParams } from "react-router";
import { Lock, Trash2, Edit, MapPin, Users, AlertTriangle } from "lucide-react";
import { RoleContext } from "../contexts/RoleContext";
import api from "../api";
import toast from "react-hot-toast";

const ClassroomCard = ({
  classroom = {},
  view = "grid",
  onClick,
  locked = false,
  onRefresh
}) => {
  const navigate = useNavigate();
  const { role, user } = useContext(RoleContext);
  const [processing, setProcessing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(Boolean(classroom.is_enrolled));

  const id = classroom.id ?? classroom.pk;
  const displayTitle =
    classroom.title ?? classroom.name ?? `Classroom ${id || ""}`;
  const displayDescription =
    classroom.description ?? "No description available";
  const displayLocation = classroom.location ?? "TBA";
  const enrolledCount = classroom.enrolled_students_count ?? 0;
  const displayCapacity = classroom.capacity ?? "—";
  const { courseid } = useParams();

  const isTeacher = (role || "").toLowerCase() === "teacher";
  const currentUserId = user?.id ?? user?.pk ?? null;

  const isOwnerTeacher =
    isTeacher &&
    currentUserId &&
    (String(currentUserId) === String(classroom.teacher_id) ||
      String(currentUserId) === String(classroom.teacher?.id) ||
      String(currentUserId) === String(classroom.teacher?.pk) ||
      String(currentUserId) === String(classroom.teacher));

  console.log("ClassroomCard Debug:", {
    classroomId: id,
    isTeacher,
    currentUserId,
    teacherId: classroom.teacher_id,
    teacher: classroom.teacher,
    isOwnerTeacher,
    classroom: classroom
  });

  const handleOnClick = useCallback(() => {
    if (locked) return;
    if (onClick) {
      onClick(classroom);
      return;
    }
    if (id) navigate(`/classroom/course/${courseid}/${id}`);
  }, [onClick, classroom, id, locked, navigate]);

  const handleEnroll = async (e) => {
    e.stopPropagation();
    if (processing) return;
    setProcessing(true);
    try {
      if (isEnrolled) {
        await api.delete(`/api/classrooms/student/classrooms/${id}/unenroll/`);
        setIsEnrolled(false);
        toast.success("Successfully unenrolled");
      } else {
        await api.post(`/api/classrooms/student/classrooms/${id}/enroll/`);
        setIsEnrolled(true);
        toast.success("Successfully enrolled");
      }
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Enroll/unenroll failed", err);
      const msg = err?.response?.data?.detail || "Operation failed";
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleting) return;
    setDeleting(true);
    setShowDeleteConfirm(false);

    try {
      try {
        await api.delete(`/api/classrooms/teacher/classrooms/${id}/delete/`);
      } catch (err) {
        await api.delete(`/api/classrooms/teacher/classrooms/${id}/`);
      }
      toast.success(`Classroom "${displayTitle}" deleted successfully`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Delete failed", err);
      const msg = err?.response?.data?.detail || "Failed to delete classroom";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = (e) => {
    e?.stopPropagation();
    setShowDeleteConfirm(false);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    navigate(`/classroom/course/${courseid}/${id}/edit`);
  };

  const DeleteConfirmModal = () => {
    if (!showDeleteConfirm) return null;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={handleDeleteCancel}
      >
        <div
          className="bg-cookie-lightcream p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="size-6 text-red-500" />
            <h3 className="text-lg font-semibold text-cookie-darkbrown">
              Delete Classroom
            </h3>
          </div>

          <p className="text-cookie-darkbrown mb-2">
            Are you sure you want to delete <strong>"{displayTitle}"</strong>?
          </p>

          <p className="text-sm text-cookie-darkbrown opacity-80 mb-6">
            This will permanently remove the classroom and all {enrolledCount}{" "}
            enrolled students. This action cannot be undone.
          </p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={handleDeleteCancel}
              className="btn btn-outline border-cookie-darkbrown text-cookie-darkbrown hover:bg-cookie-darkbrown hover:text-cookie-white"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="btn btn-error text-white hover:bg-red-600"
            >
              {deleting ? "Deleting..." : "Delete Classroom"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (view === "list") {
    return (
      <>
        <div
          onClick={handleOnClick}
          className={`flex items-center gap-4 p-4 bg-cookie-lightcream rounded-lg shadow-sm border ${
            locked
              ? "opacity-60 cursor-not-allowed"
              : "cursor-pointer hover:shadow-md transition-shadow"
          }`}
        >
          <div className="w-16 h-16 bg-cookie-lightorange rounded-md flex-shrink-0 flex items-center justify-center">
            <div className="text-cookie-darkbrown font-bold">#{id}</div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-cookie-darkbrown text-lg truncate mb-1">
              {displayTitle}
            </h3>
            <p className="text-sm text-cookie-darkbrown opacity-80 mb-2 line-clamp-1">
              {displayDescription}
            </p>
            <div className="flex gap-4 text-xs text-cookie-darkbrown">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {displayLocation}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {enrolledCount}/{displayCapacity}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div
            className="flex flex-col gap-2 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <Link
              to={`/classroom/course/${courseid}/${id}/`}
              className="btn btn-xs bg-cookie-darkbrown text-cookie-white border-cookie-darkbrown"
            >
              View Details
            </Link>

            {/* Show buttons for all teachers temporarily for debugging */}
            {isTeacher && (
              <>
                <button
                  onClick={handleEditClick}
                  className="btn btn-xs btn-outline border-cookie-darkbrown text-cookie-darkbrown hover:bg-cookie-darkbrown hover:text-cookie-white"
                >
                  <Edit className="size-3" />
                  Edit
                </button>
                <button
                  onClick={handleDeleteClick}
                  disabled={deleting}
                  className="btn btn-xs btn-error text-white hover:bg-red-600"
                >
                  {deleting ? (
                    "..."
                  ) : (
                    <>
                      <Trash2 className="size-3" /> Delete
                    </>
                  )}
                </button>
              </>
            )}

            {/* Student enroll button */}
            {!isTeacher && (
              <button
                onClick={handleEnroll}
                disabled={processing}
                className={`btn btn-xs ${
                  isEnrolled
                    ? "btn-outline border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    : "bg-cookie-darkbrown text-cookie-white border-cookie-darkbrown hover:bg-cookie-darkbrown/90"
                }`}
              >
                {processing ? "..." : isEnrolled ? "Unenroll" : "Enroll"}
              </button>
            )}
          </div>

          {locked && (
            <div className="flex items-center gap-1 text-cookie-darkbrown">
              <Lock className="w-4 h-4" />
              <span className="text-sm">Locked</span>
            </div>
          )}
        </div>
        <DeleteConfirmModal />
      </>
    );
  }

  return (
    <>
      <div
        onClick={handleOnClick}
        className={`card relative bg-cookie-lightcream w-full shadow-xl border ${
          locked
            ? "opacity-60 cursor-not-allowed"
            : "cursor-pointer hover:shadow-2xl transition-shadow"
        }`}
      >
        <div className="h-32 bg-cookie-lightorange rounded-t-md flex items-center justify-center">
          <div className="text-cookie-darkbrown font-bold text-xl">#{id}</div>
        </div>

        <div className="p-4">
          <h2 className="text-lg font-semibold text-cookie-darkbrown truncate mb-2">
            {displayTitle}
          </h2>
          <p className="text-sm text-cookie-darkbrown mb-3 line-clamp-2">
            {displayDescription}
          </p>

          <div className="flex justify-between text-xs text-cookie-darkbrown mb-4">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {displayLocation}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {enrolledCount}/{displayCapacity}
            </span>
          </div>

          {/* Enrollment status indicator */}
          {!isTeacher && isEnrolled && (
            <div className="mb-3 px-2 py-1 bg-green-100 border border-green-300 rounded text-xs text-green-800">
              ✓ Enrolled
            </div>
          )}

          {/* Action buttons */}
          <div
            className="flex gap-2 items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Link
              to={`/classroom/course/${courseid}/${id}`}
              className="btn btn-sm flex-1 bg-cookie-darkbrown text-cookie-white border-cookie-darkbrown"
            >
              View Details
            </Link>

            {/* Show buttons for all teachers temporarily for debugging */}
            {isTeacher && (
              <>
                <button
                  onClick={handleEditClick}
                  className="btn btn-sm btn-outline border-cookie-darkbrown text-cookie-darkbrown hover:bg-cookie-darkbrown hover:text-cookie-white"
                >
                  <Edit className="size-4" />
                </button>
                <button
                  onClick={handleDeleteClick}
                  disabled={deleting}
                  className="btn btn-sm btn-error text-white hover:bg-red-600"
                >
                  {deleting ? "..." : <Trash2 className="size-4" />}
                </button>
              </>
            )}
          </div>

          {/* Student enroll button - separate row */}
          {!isTeacher && (
            <div className="mt-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={handleEnroll}
                disabled={processing}
                className={`btn btn-sm w-full ${
                  isEnrolled
                    ? "btn-outline border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    : "bg-cookie-darkbrown text-cookie-white border-cookie-darkbrown hover:bg-cookie-darkbrown/90"
                }`}
              >
                {processing
                  ? "Processing..."
                  : isEnrolled
                  ? "Unenroll"
                  : "Enroll"}
              </button>
            </div>
          )}
        </div>

        {locked && (
          <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cookie-lightorange text-cookie-darkbrown text-xs">
            <Lock className="w-3 h-3" />
            Locked
          </div>
        )}
      </div>
      <DeleteConfirmModal />
    </>
  );
};

export default ClassroomCard;
