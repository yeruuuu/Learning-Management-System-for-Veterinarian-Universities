import { useState, useEffect, useMemo, useContext } from "react";
import api from "../api";
import toast from "react-hot-toast";
import { ArrowLeft, X, Check } from "lucide-react";
import { Link } from "react-router";
import SearchBar from "../components/SearchBar";
import { ViewContext } from "../contexts/ViewContext";
import ViewToggle from "../components/ViewToggle";

const ManageStudent = () => {
  const [activeStudents, setActiveStudents] = useState([]);
  const [bannedStudents, setBannedStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active"); // active, banned

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const [activeRes, bannedRes] = await Promise.all([
          api.get("api/accounts/students/"),
          api.get("api/accounts/students/?status=banned")
        ]);
        setActiveStudents(activeRes.data);
        setBannedStudents(bannedRes.data);
      } catch (error) {
        toast.error("Failed to get students");
      }
    };
    fetchStudents();
  }, []);

  const handleBan = async (studentEmail) => {
    try {
      await api.patch(`api/accounts/deactivate-student/${studentEmail}/`);
      toast.success("Successfully banned student");
      const student = activeStudents.find((s) => s.email === studentEmail);
      if (student) {
        setActiveStudents((prev) =>
          prev.filter((s) => s.email !== studentEmail)
        );
        setBannedStudents((prev) => [
          ...prev,
          { ...student, is_active: false }
        ]);
      }
    } catch (error) {
      toast.error("Failed to ban student");
    }
  };

  const handleUnban = async (studentEmail) => {
    try {
      await api.patch(`api/accounts/unban-student/${studentEmail}/`);
      toast.success("Successfully unbanned student");
      const student = bannedStudents.find((s) => s.email === studentEmail);
      if (student) {
        setBannedStudents((prev) =>
          prev.filter((s) => s.email !== studentEmail)
        );
        setActiveStudents((prev) => [...prev, { ...student, is_active: true }]);
      }
    } catch (error) {
      toast.error("Failed to unban student");
    }
  };

  const filterStudents = (students) => {
    if (!searchQuery) return students;
    const query = searchQuery.toLowerCase();
    return students.filter(
      (student) =>
        `${student.first_name} ${student.last_name}`
          .toLowerCase()
          .includes(query) ||
        (student.email && student.email.toLowerCase().includes(query))
    );
  };

  const filteredStudents = useMemo(() => {
    const filtered = {
      active: filterStudents(activeStudents),
      banned: filterStudents(bannedStudents)
    };
    return filtered[activeTab] || [];
  }, [activeStudents, bannedStudents, searchQuery, activeTab]);

  const { view } = useContext(ViewContext);

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
        <div className="flex justify-center gap-4 mb-6">
          <button
            className={`px-6 py-3 rounded-lg font-semibold shadow-md ${
              activeTab === "active"
                ? "bg-cookie-darkbrown text-white"
                : "bg-white text-cookie-darkbrown hover:bg-cookie-brown/10"
            }`}
            onClick={() => setActiveTab("active")}
          >
            Active Students
          </button>
          <button
            className={`px-6 py-3 rounded-lg font-semibold shadow-md ${
              activeTab === "banned"
                ? "bg-cookie-darkbrown text-white"
                : "bg-white text-cookie-darkbrown hover:bg-cookie-brown/10"
            }`}
            onClick={() => setActiveTab("banned")}
          >
            Banned Students
          </button>
        </div>
        <div className="max-w-xl mx-auto">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search students by name or email..."
          />
        </div>
      </div>
      <div className="flex justify-center">
        {view === "grid" ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6 px-4">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <div key={student.id}>
                  <div className="bg-cookie-white rounded-lg shadow-lg p-6 flex items-center justify-between gap-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {student.first_name} {student.last_name}
                      </h3>
                      <div className="text-sm text-gray-500">
                        {student.email}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {activeTab === "active" && (
                        <button
                          onClick={() => handleBan(student.email)}
                          className="px-4 py-2 rounded-lg bg-red-100 text-red-600 font-semibold hover:bg-red-200 transition-colors duration-200"
                        >
                          Ban
                        </button>
                      )}
                      {activeTab === "banned" && (
                        <button
                          onClick={() => handleUnban(student.email)}
                          className="px-4 py-2 rounded-lg bg-green-100 text-green-600 font-semibold hover:bg-green-200 transition-colors duration-200"
                        >
                          Unban
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex justify-center items-center min-h-64">
                <p className="text-cookie-darkbrown text-2xl">
                  {activeTab === "active" &&
                    activeStudents.length === 0 &&
                    "There are no active students"}
                  {activeTab === "banned" &&
                    bannedStudents.length === 0 &&
                    "There are no banned students"}
                  {((activeTab === "active" && activeStudents.length > 0) ||
                    (activeTab === "banned" && bannedStudents.length > 0)) &&
                    "No students match your search"}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2 mt-6 px-4 w-full max-w-2xl">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="bg-cookie-white rounded-lg shadow-lg p-2 flex items-center justify-between gap-2"
                >
                  <div>
                    <h3 className="font-semibold text-gray-800 text-base">
                      {student.first_name} {student.last_name}
                    </h3>
                    <div className="text-xs text-gray-500">{student.email}</div>
                  </div>
                  <div className="flex gap-1">
                    {activeTab === "active" && (
                      <button
                        onClick={() => handleBan(student.email)}
                        className="px-2 py-1 rounded-lg bg-red-100 text-red-600 font-semibold hover:bg-red-200 transition-colors duration-200 text-xs"
                      >
                        Ban
                      </button>
                    )}
                    {activeTab === "banned" && (
                      <button
                        onClick={() => handleUnban(student.email)}
                        className="px-2 py-1 rounded-lg bg-green-100 text-green-600 font-semibold hover:bg-green-200 transition-colors duration-200 text-xs"
                      >
                        Unban
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex justify-center items-center min-h-64">
                <p className="text-cookie-darkbrown text-2xl">
                  {activeTab === "active" &&
                    activeStudents.length === 0 &&
                    "There are no active students"}
                  {activeTab === "banned" &&
                    bannedStudents.length === 0 &&
                    "There are no banned students"}
                  {((activeTab === "active" && activeStudents.length > 0) ||
                    (activeTab === "banned" && bannedStudents.length > 0)) &&
                    "No students match your search"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default ManageStudent;
