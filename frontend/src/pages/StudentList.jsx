import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import api from "../api";
import toast from "react-hot-toast";

const StudentList = () => {
  const { courseid } = useParams();
  const [students, setStudents] = useState([]);
  const [courseTitle, setCourseTitle] = useState("");
  const [loading, setLoading] = useState(true);

  // Helper function to get status badge styling
  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || "active";

    const statusStyles = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      suspended: "bg-yellow-100 text-yellow-800",
      banned: "bg-red-100 text-red-800",
      withdrawn: "bg-blue-100 text-blue-800",
      pending: "bg-orange-100 text-orange-800"
    };

    const style = statusStyles[statusLower] || "bg-gray-100 text-gray-800";
    const displayStatus =
      status?.charAt(0).toUpperCase() + status?.slice(1) || "Active";

    return (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${style}`}
      >
        {displayStatus}
      </span>
    );
  };

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        console.log("Fetching students for course:", courseid);
        const res = await api.get(`/api/courses/${courseid}/students/`);
        console.log("Student list response:", res.data);
        setStudents(res.data.students || []);
        setCourseTitle(res.data.course_title || "");
      } catch (error) {
        console.error("Error fetching students:", error);
        console.error("Error response:", error.response);
        console.error("Error message:", error.message);

        if (error.response?.status === 403) {
          toast.error("You don't have permission to view this student list");
        } else if (error.response?.status === 404) {
          toast.error("Course not found");
        } else if (error.response?.data?.error) {
          toast.error(error.response.data.error);
        } else {
          toast.error(`Failed to fetch student list: ${error.message}`);
        }
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    if (courseid) {
      fetchStudents();
    }
  }, [courseid]);

  return (
    <div className="min-h-screen pb-12">
      <div className="ml-8 mt-2">
        <Link
          to={`/course/${courseid}`}
          className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown"
        >
          <ArrowLeft className="size-5" />
          Back
        </Link>
      </div>

      <div className="px-8 pt-4">
        <h2 className="font-bold text-3xl">
          Student List{courseTitle ? `: ${courseTitle}` : ""}
        </h2>
        <p className="text-gray-600 mt-2">Total Students: {students.length}</p>
      </div>

      <div className="mt-8 px-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cookie-brown"></div>
          </div>
        ) : students.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-cookie-lightbrown">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cookie-darkbrown uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cookie-darkbrown uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cookie-darkbrown uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cookie-darkbrown uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student, index) => (
                  <tr
                    key={student.id}
                    className="hover:bg-cookie-cream cursor-pointer transition-colors duration-150"
                    onClick={() =>
                      (window.location.href = `/course/${courseid}/student/${student.id}`)
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {student.first_name} {student.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {student.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(student.enrollment_status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <p className="text-cookie-darkbrown text-2xl">
                No students enrolled in this course yet
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default StudentList;
