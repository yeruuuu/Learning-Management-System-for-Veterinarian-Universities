import { useEffect, useState, useMemo, useContext } from "react";
import api from "../api";
import toast from "react-hot-toast";
import { Check, X, ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import SearchBar from "../components/SearchBar";
import { ViewContext } from "../contexts/ViewContext";
import ViewToggle from "../components/ViewToggle";

const ManageTeacher = () => {
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [approvedTeachers, setApprovedTeachers] = useState([]);
  const [bannedTeachers, setBannedTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pending"); // pending, approved, banned

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const [pendingRes, approvedRes, bannedRes] = await Promise.all([
          api.get("api/accounts/teachers?status=pending"),
          api.get("api/accounts/teachers?status=approved"),
          api.get("api/accounts/teachers?status=banned")
        ]);
        setPendingTeachers(pendingRes.data);
        setApprovedTeachers(approvedRes.data);
        setBannedTeachers(bannedRes.data);
      } catch (error) {
        toast.error("Failed to get teacher accounts");
      }
    };
    fetchTeachers();
  }, []);

  const handleApprove = async (teacherId) => {
    try {
      await api.patch(`api/accounts/approve-teacher/${teacherId}/`, {
        is_approved: true
      });
      toast.success("Teacher successfully approved");

      // Move teacher from pending to approved
      const teacher = pendingTeachers.find((t) => t.id === teacherId);
      if (teacher) {
        setPendingTeachers((prev) => prev.filter((t) => t.id !== teacherId));
        setApprovedTeachers((prev) => [
          ...prev,
          { ...teacher, is_approved: true }
        ]);
      }
    } catch (error) {
      toast.error("Failed to approve teacher");
    }
  };

  const handleBan = async (teacherId) => {
    try {
      await api.patch(`api/accounts/ban-teacher/${teacherId}/`);
      toast.success("Teacher successfully banned");

      // Move teacher from approved to banned
      const teacher = approvedTeachers.find((t) => t.id === teacherId);
      if (teacher) {
        setApprovedTeachers((prev) => prev.filter((t) => t.id !== teacherId));
        setBannedTeachers((prev) => [
          ...prev,
          { ...teacher, is_active: false }
        ]);
      }
    } catch (error) {
      toast.error("Failed to ban teacher");
    }
  };

  const handleUnban = async (teacherId) => {
    try {
      await api.patch(`api/accounts/unban-teacher/${teacherId}/`);
      toast.success("Teacher successfully unbanned");

      // Move teacher from banned to approved
      const teacher = bannedTeachers.find((t) => t.id === teacherId);
      if (teacher) {
        setBannedTeachers((prev) => prev.filter((t) => t.id !== teacherId));
        setApprovedTeachers((prev) => [
          ...prev,
          { ...teacher, is_active: true }
        ]);
      }
    } catch (error) {
      toast.error("Failed to unban teacher");
    }
  };

  const handleDisapprove = (teacherId) => {
    setPendingTeachers((prev) => prev.filter((t) => t.id !== teacherId));
    toast.success("Teacher removed from pending list");
  };

  const filterTeachers = (teachers) => {
    if (!searchQuery) return teachers;
    const query = searchQuery.toLowerCase();
    return teachers.filter(
      (teacher) =>
        `${teacher.first_name} ${teacher.last_name}`
          .toLowerCase()
          .includes(query) ||
        (teacher.email && teacher.email.toLowerCase().includes(query))
    );
  };

  const filteredTeachers = useMemo(() => {
    const filtered = {
      pending: filterTeachers(pendingTeachers),
      approved: filterTeachers(approvedTeachers),
      banned: filterTeachers(bannedTeachers)
    };
    return filtered[activeTab] || [];
  }, [
    pendingTeachers,
    approvedTeachers,
    bannedTeachers,
    searchQuery,
    activeTab
  ]);

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
      <div className="px-4 mt-6">
        <div className="flex justify-center gap-4 mb-6">
          <button
            className={`px-6 py-3 rounded-lg font-semibold shadow-md ${
              activeTab === "pending"
                ? "bg-cookie-darkbrown text-white"
                : "bg-white text-cookie-darkbrown hover:bg-cookie-brown/10"
            }`}
            onClick={() => setActiveTab("pending")}
          >
            Pending Approval
          </button>
          <button
            className={`px-6 py-3 rounded-lg font-semibold shadow-md ${
              activeTab === "approved"
                ? "bg-cookie-darkbrown text-white"
                : "bg-white text-cookie-darkbrown hover:bg-cookie-brown/10"
            }`}
            onClick={() => setActiveTab("approved")}
          >
            Approved Teachers
          </button>
          <button
            className={`px-6 py-3 rounded-lg font-semibold shadow-md ${
              activeTab === "banned"
                ? "bg-cookie-darkbrown text-white"
                : "bg-white text-cookie-darkbrown hover:bg-cookie-brown/10"
            }`}
            onClick={() => setActiveTab("banned")}
          >
            Banned Teachers
          </button>
        </div>
        <div className="max-w-xl mx-auto">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search teachers by name or email..."
          />
        </div>
      </div>
      <div className="flex justify-center p-4">
        {view === "grid" ? (
          <div className="flex flex-col gap-6">
            {filteredTeachers.length > 0 ? (
              filteredTeachers.map((teacher) => (
                <div key={teacher.id}>
                  <div className="bg-cookie-white rounded-lg shadow-lg p-6 flex items-center justify-between gap-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {teacher.first_name} {teacher.last_name}
                      </h3>
                      <div className="text-sm text-gray-500">
                        {teacher.email}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {activeTab === "pending" && (
                        <>
                          <button onClick={() => handleApprove(teacher.id)}>
                            <Check className="size-10 p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors duration-200" />
                          </button>
                          <button onClick={() => handleDisapprove(teacher.id)}>
                            <X className="size-10 p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors duration-200" />
                          </button>
                        </>
                      )}
                      {activeTab === "approved" && (
                        <button
                          onClick={() => handleBan(teacher.id)}
                          className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors duration-200"
                        >
                          Ban Teacher
                        </button>
                      )}
                      {activeTab === "banned" && (
                        <button
                          onClick={() => handleUnban(teacher.id)}
                          className="px-4 py-2 text-sm font-semibold text-green-600 bg-green-100 rounded-lg hover:bg-green-200 transition-colors duration-200"
                        >
                          Unban Teacher
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex justify-center items-center min-h-64">
                <p className="text-cookie-darkbrown text-2xl">
                  {pendingTeachers.length === 0
                    ? "There are no pending teacher accounts"
                    : "No teachers match your search"}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2 mt-6 px-4 w-full max-w-2xl">
            {filteredTeachers.length > 0 ? (
              filteredTeachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="bg-cookie-white rounded-lg shadow-lg p-2 flex items-center justify-between gap-2"
                >
                  <div>
                    <h3 className="font-semibold text-gray-800 text-base">
                      {teacher.first_name} {teacher.last_name}
                    </h3>
                    <div className="text-xs text-gray-500">{teacher.email}</div>
                  </div>
                  <div className="flex gap-1">
                    {activeTab === "pending" && (
                      <>
                        <button onClick={() => handleApprove(teacher.id)}>
                          <Check className="size-7 p-1 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors duration-200" />
                        </button>
                        <button onClick={() => handleDisapprove(teacher.id)}>
                          <X className="size-7 p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors duration-200" />
                        </button>
                      </>
                    )}
                    {activeTab === "approved" && (
                      <button
                        onClick={() => handleBan(teacher.id)}
                        className="px-2 py-1 text-xs font-semibold text-red-600 bg-red-100 rounded-full hover:bg-red-200 transition-colors duration-200"
                      >
                        Ban
                      </button>
                    )}
                    {activeTab === "banned" && (
                      <button
                        onClick={() => handleUnban(teacher.id)}
                        className="px-2 py-1 text-xs font-semibold text-green-600 bg-green-100 rounded-full hover:bg-green-200 transition-colors duration-200"
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
                  {pendingTeachers.length === 0
                    ? "There are no pending teacher accounts"
                    : "No teachers match your search"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default ManageTeacher;
