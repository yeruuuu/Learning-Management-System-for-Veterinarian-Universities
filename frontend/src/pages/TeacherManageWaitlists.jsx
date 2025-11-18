import { useState, useEffect, useContext } from "react";
import { Link, useParams } from "react-router";
import { RoleContext } from "../contexts/RoleContext";
import api from "../api";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Users,
  UserPlus,
  Clock,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  RefreshCw
} from "lucide-react";

const TeacherManageWaitlists = () => {
  const [waitlistData, setWaitlistData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedClassrooms, setExpandedClassrooms] = useState({});
  const [allocatingStudent, setAllocatingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClassroom, setFilterClassroom] = useState("");
  const { user } = useContext(RoleContext);
  const { courseid } = useParams();

  useEffect(() => {
    fetchAllWaitlists();
  }, []);

  const fetchAllWaitlists = async () => {
    setLoading(true);

    try {
      const response = await api.get("/api/classrooms/teacher/all-waitlists/");
      setWaitlistData(response.data);
    } catch (err) {
      console.error("Failed to fetch waitlists:", err);
      toast.error("Failed to load waitlists");
    } finally {
      setLoading(false);
    }
  };

  const handleAllocateStudent = async (studentId, targetClassroomId) => {
    setAllocatingStudent(studentId);
    try {
      const response = await api.post(
        "/api/classrooms/teacher/all-waitlists/",
        {
          student_id: studentId,
          target_classroom_id: targetClassroomId
        }
      );
      toast.success(response.data.detail);
      fetchAllWaitlists();
    } catch (err) {
      console.error("Failed to allocate student:", err);
      toast.error(err.response?.data?.detail || "Failed to allocate student");
    } finally {
      setAllocatingStudent(null);
    }
  };

  const handleBulkAllocate = async () => {
    if (!waitlistData?.global_waitlist?.length) {
      toast.error("No students to allocate");
      return;
    }

    const availableClassrooms = waitlistData.teacher_classrooms?.filter(
      (classroom) => classroom.available_seats > 0
    );

    if (!availableClassrooms?.length) {
      toast.error("No classrooms with available seats");
      return;
    }

    try {
      const allocations = [];
      let classroomIndex = 0;

      for (const student of waitlistData.global_waitlist) {
        const targetClassroom =
          availableClassrooms[classroomIndex % availableClassrooms.length];
        if (targetClassroom.available_seats > 0) {
          allocations.push({
            student_id: student.student_id,
            target_classroom_id: targetClassroom.id
          });
          targetClassroom.available_seats--;
          classroomIndex++;
        }
      }

      for (const allocation of allocations.slice(0, 10)) {
        await handleAllocateStudent(
          allocation.student_id,
          allocation.target_classroom_id
        );
      }

      toast.success(`Allocated ${Math.min(allocations.length, 10)} students`);
    } catch (err) {
      toast.error("Failed to complete bulk allocation");
    }
  };

  const toggleClassroom = (classroomId) => {
    setExpandedClassrooms((prev) => ({
      ...prev,
      [classroomId]: !prev[classroomId]
    }));
  };

  const toggleAllClassrooms = () => {
    const allExpanded = waitlistData?.classroom_waitlists?.every(
      (classroom) => expandedClassrooms[classroom.classroom_id]
    );

    const newState = {};
    waitlistData?.classroom_waitlists?.forEach((classroom) => {
      newState[classroom.classroom_id] = !allExpanded;
    });
    setExpandedClassrooms(newState);
  };

  const filteredGlobalWaitlist = waitlistData?.global_waitlist?.filter(
    (student) => {
      const matchesSearch =
        student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClassroom =
        !filterClassroom ||
        student.current_classroom_id.toString() === filterClassroom;
      return matchesSearch && matchesClassroom;
    }
  );

  const filteredClassroomWaitlists = waitlistData?.classroom_waitlists?.filter(
    (classroom) => {
      if (!filterClassroom) return true;
      return classroom.classroom_id.toString() === filterClassroom;
    }
  );

  if (loading) {
    return (
      <div className="min-h-screen px-6 pt-8 bg-cookie-cream">
        <div className="text-cookie-darkbrown flex items-center justify-center">
          <RefreshCw className="size-6 animate-spin mr-2" />
          Loading waitlists...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 pt-8 bg-cookie-cream">
      <div className="mb-4">
        <Link
          to={`/classroom/course/${courseid}`}
          className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown"
        >
          <ArrowLeft className="size-5" /> Back to Classrooms
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-cookie-darkbrown flex items-center">
          <Users className="size-6 mr-3 text-orange-500" />
          Manage All Waitlists
        </h2>
      </div>

      {/* Summary Stats */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-semibold text-cookie-darkbrown">
            Total Students on Waitlists
          </h3>
          <p className="text-2xl font-bold text-orange-500">
            {filteredGlobalWaitlist?.length || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-semibold text-cookie-darkbrown">
            Classrooms with Waitlists
          </h3>
          <p className="text-2xl font-bold text-blue-500">
            {filteredClassroomWaitlists?.length || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-semibold text-cookie-darkbrown">
            Available Seats
          </h3>
          <p className="text-2xl font-bold text-green-500">
            {waitlistData?.teacher_classrooms?.reduce(
              (sum, classroom) => sum + classroom.available_seats,
              0
            ) || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-semibold text-cookie-darkbrown">Actions</h3>
          <button
            onClick={handleBulkAllocate}
            disabled={!filteredGlobalWaitlist?.length}
            className="btn btn-sm bg-purple-500 text-white border border-purple-500 hover:bg-purple-600 w-full"
          >
            <UserPlus className="size-4 mr-1" />
            Bulk Allocate
          </button>
        </div>
      </div>

      {/* Global Waitlist - All Students */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-cookie-darkbrown">
            All Students on Waitlists
          </h3>
          <span className="text-sm text-gray-600">
            Showing {filteredGlobalWaitlist?.length || 0} of{" "}
            {waitlistData?.global_waitlist?.length || 0} students
          </span>
        </div>

        {filteredGlobalWaitlist && filteredGlobalWaitlist.length > 0 ? (
          <div className="space-y-4">
            {filteredGlobalWaitlist.map((student, index) => (
              <div
                key={student.enrollment_id}
                className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-orange-100 p-2 rounded-full">
                      <span className="text-orange-600 font-bold">
                        #{index + 1}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-cookie-darkbrown">
                        {student.student_name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {student.student_email}
                      </p>
                      <p className="text-sm text-gray-500">
                        Currently waitlisted for:{" "}
                        <span className="font-medium">
                          {student.current_classroom_title}
                        </span>
                      </p>
                      {student.joined_waitlist && (
                        <p className="text-sm text-gray-500">
                          <Clock className="size-3 inline mr-1" />
                          Joined:{" "}
                          {new Date(
                            student.joined_waitlist
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <select
                      className="select select-bordered select-sm bg-white border-gray-300"
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAllocateStudent(
                            student.student_id,
                            parseInt(e.target.value)
                          );
                          e.target.value = "";
                        }
                      }}
                      disabled={allocatingStudent === student.student_id}
                    >
                      <option value="">Allocate to classroom...</option>
                      {waitlistData.teacher_classrooms
                        ?.filter((classroom) => classroom.available_seats > 0)
                        .map((classroom) => (
                          <option key={classroom.id} value={classroom.id}>
                            {classroom.title} ({classroom.available_seats}{" "}
                            seats)
                          </option>
                        ))}
                    </select>
                    {allocatingStudent === student.student_id && (
                      <div className="loading loading-spinner loading-sm"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="size-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              {searchTerm || filterClassroom
                ? "No students match your filters."
                : "No students on any waitlists."}
            </p>
          </div>
        )}
      </div>

      {/* Classroom-specific Waitlists */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-cookie-darkbrown">
            Waitlists by Classroom
          </h3>
          <button
            onClick={toggleAllClassrooms}
            className="btn btn-sm btn-outline border-cookie-darkbrown text-cookie-darkbrown"
          >
            {waitlistData?.classroom_waitlists?.every(
              (classroom) => expandedClassrooms[classroom.classroom_id]
            )
              ? "Collapse All"
              : "Expand All"}
          </button>
        </div>

        {filteredClassroomWaitlists && filteredClassroomWaitlists.length > 0 ? (
          <div className="space-y-4">
            {filteredClassroomWaitlists.map((classroom) => (
              <div
                key={classroom.classroom_id}
                className="bg-white rounded-lg border border-gray-200 shadow-sm"
              >
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleClassroom(classroom.classroom_id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {expandedClassrooms[classroom.classroom_id] ? (
                        <ChevronDown className="size-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="size-5 text-gray-400" />
                      )}
                      <h4 className="text-lg font-semibold text-cookie-darkbrown">
                        {classroom.classroom_title}
                      </h4>
                      <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-sm font-medium">
                        {classroom.waitlist_count} waitlisted
                      </span>
                      <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-sm font-medium">
                        {classroom.available_seats} seats available
                      </span>
                    </div>
                  </div>
                </div>

                {expandedClassrooms[classroom.classroom_id] && (
                  <div className="border-t border-gray-200 p-4">
                    <div className="space-y-3">
                      {classroom.waitlist.map((student, index) => (
                        <div
                          key={student.enrollment_id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="bg-orange-100 p-1 rounded-full">
                              <span className="text-orange-600 text-sm font-bold">
                                #{index + 1}
                              </span>
                            </div>
                            <div>
                              <h5 className="font-medium text-cookie-darkbrown">
                                {student.student_name}
                              </h5>
                              <p className="text-sm text-gray-600">
                                {student.student_email}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() =>
                              handleAllocateStudent(
                                student.student_id,
                                classroom.classroom_id
                              )
                            }
                            disabled={
                              classroom.available_seats <= 0 ||
                              allocatingStudent === student.student_id
                            }
                            className={`btn btn-sm ${
                              classroom.available_seats > 0
                                ? "bg-green-500 text-white border border-green-500 hover:bg-green-600"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                          >
                            {allocatingStudent === student.student_id ? (
                              <div className="loading loading-spinner loading-xs"></div>
                            ) : (
                              <>
                                <UserPlus className="size-4 mr-1" />
                                {classroom.available_seats > 0
                                  ? "Allocate"
                                  : "No Seats"}
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="size-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              {filterClassroom
                ? "No waitlists for selected classroom."
                : "No classrooms have waitlists."}
            </p>
          </div>
        )}
      </div>

      {/* Debug: Show if waitlist_students exists */}
      {user?.teacher_profile || user?.is_staff ? (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            border: "1px solid #ddd",
            borderRadius: "5px"
          }}
        >
          <h3>Waitlist Management</h3>

          {/* Debug info */}
          <p>
            Debug: waitlist_students = {waitlistData?.global_waitlist?.length}{" "}
            entries
          </p>

          {waitlistData?.global_waitlist?.length ? (
            <p>
              Students waiting to join ({waitlistData.global_waitlist.length}):
            </p>
          ) : (
            <p>No students on the waitlist.</p>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default TeacherManageWaitlists;
