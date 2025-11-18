import { useState, useEffect, useContext, useMemo } from "react";
import api from "../api";
import toast from "react-hot-toast";
import { ArrowLeft, X, Check } from "lucide-react";
import SearchBar from "../components/SearchBar";
import { RoleContext } from "../contexts/RoleContext";
import { Link } from "react-router";
import { ViewContext } from "../contexts/ViewContext";
import ViewToggle from "../components/ViewToggle";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("teachers");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userCourses, setUserCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const { role } = useContext(RoleContext);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("api/accounts/users/");
        setUsers(res.data);
      } catch (error) {
        toast.error("Failed to get users");
      }
    };
    fetchUsers();
  }, []);

  const fetchStudentCourses = async (userId) => {
    setLoadingCourses(true);
    try {
      const res = await api.get(`api/accounts/users/${userId}/courses/`);
      setUserCourses(res.data);
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.detail ||
          "Failed to fetch student's courses"
      );
      setUserCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchTeacherCourses = async (userId) => {
    setLoadingCourses(true);
    try {
      const res = await api.get(`api/accounts/users/${userId}/teaching/`);
      setUserCourses(res.data);
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.detail ||
          "Failed to fetch teacher's courses"
      );
      setUserCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    if (user.role === "student") {
      fetchStudentCourses(user.id);
    } else if (user.role === "teacher") {
      fetchTeacherCourses(user.id);
    }
  };

  const closeModal = () => {
    setSelectedUser(null);
    setUserCourses([]);
  };

  const filteredUsers = useMemo(() => {
    // First filter by role
    let filtered = users.filter((user) =>
      activeTab === "teachers"
        ? user.role === "teacher"
        : user.role === "student"
    );

    // Then apply search query if exists
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          `${user.first_name} ${user.last_name}`
            .toLowerCase()
            .includes(query) ||
          (user.email && user.email.toLowerCase().includes(query))
      );
    }
    return filtered;
  }, [users, searchQuery, activeTab]);

  const { view, setView } = useContext(ViewContext);

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
      <div className="flex justify-center mt-6">
        <div className="tabs tabs-boxed bg-cookie-lightbrown">
          <button
            className={`tab ${
              activeTab === "teachers"
                ? "tab-active bg-cookie-brown text-white"
                : ""
            }`}
            onClick={() => setActiveTab("teachers")}
          >
            Teachers
          </button>
          <button
            className={`tab ${
              activeTab === "students"
                ? "tab-active bg-cookie-brown text-white"
                : ""
            }`}
            onClick={() => setActiveTab("students")}
          >
            Students
          </button>
        </div>
      </div>
      <div className="px-4 mt-6 max-w-xl mx-auto">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={`Search ${activeTab} by name or email...`}
        />
      </div>
      <div className="flex justify-center">
        {view === "grid" ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6 px-4">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div key={user.id}>
                  <div
                    className="bg-cookie-white rounded-lg shadow-lg p-4 flex flex-col gap-2 cursor-pointer hover:shadow-xl transition-shadow"
                    onClick={() => handleUserClick(user)}
                  >
                    <h3 className="text-lg font-semibold text-gray-800">
                      {user.first_name} {user.last_name}
                    </h3>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex justify-center items-center min-h-64">
                <p className="text-cookie-darkbrown text-2xl">
                  {users.length === 0
                    ? `There are no current ${activeTab}`
                    : `No ${activeTab} match your search`}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3 mt-6 px-4 w-full max-w-2xl">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-cookie-white rounded-lg shadow-lg p-2 flex items-center justify-between gap-3 cursor-pointer hover:shadow-xl transition-shadow"
                  onClick={() => handleUserClick(user)}
                >
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-gray-800">
                      {user.first_name} {user.last_name}
                    </h3>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex justify-center items-center min-h-64">
                <p className="text-cookie-darkbrown text-2xl">
                  {users.length === 0
                    ? `There are no current ${activeTab}`
                    : `No ${activeTab} match your search`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal for User Courses */}
      {selectedUser && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-cookie-brown text-white p-4 flex justify-between items-center flex-shrink-0">
              <h2 className="text-xl font-bold">
                {selectedUser.first_name} {selectedUser.last_name}'s{" "}
                {selectedUser.role === "student" ? "Enrolled" : "Teaching"}{" "}
                Courses
              </h2>
              <button
                onClick={closeModal}
                className="hover:bg-cookie-darkbrown rounded-full p-2 transition-colors flex-shrink-0"
                aria-label="Close modal"
              >
                <X className="size-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {loadingCourses ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cookie-brown"></div>
                </div>
              ) : userCourses.length > 0 ? (
                <div className="space-y-4">
                  {userCourses.map((course) => (
                    <div
                      key={course.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            {course.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {course.description}
                          </p>
                          <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-cookie-darkbrown">
                                Credit Points:
                              </span>
                              <span className="bg-cookie-lightbrown text-cookie-darkbrown px-3 py-1 rounded-full text-sm font-semibold">
                                {course.total_credits}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-600">
                                Duration:
                              </span>
                              <span className="text-sm text-gray-700">
                                {course.duration.replace("_", " ")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-600">
                                Status:
                              </span>
                              <span
                                className={`text-sm capitalize ${
                                  course.status === "published"
                                    ? "text-green-600"
                                    : "text-gray-600"
                                }`}
                              >
                                {course.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="mt-6 p-4 bg-cookie-lightbrown rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-cookie-darkbrown">
                        Total Credit Points:
                      </span>
                      <span className="text-2xl font-bold text-cookie-darkbrown">
                        {userCourses.reduce(
                          (sum, course) => sum + course.total_credits,
                          0
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg">
                    This {selectedUser.role}{" "}
                    {selectedUser.role === "student"
                      ? "is not enrolled in"
                      : "is not teaching"}{" "}
                    any courses yet.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end flex-shrink-0">
              <button
                onClick={closeModal}
                className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown hover:bg-cookie-brown transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Users;
