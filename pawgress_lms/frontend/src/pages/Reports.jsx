import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Users,
  GraduationCap,
  TrendingUp,
  BookOpen,
  Award,
  BarChart3,
  RefreshCw,
  ArrowLeft
} from "lucide-react";
import api from "../api";
import toast from "react-hot-toast";

const Reports = () => {
  const [universityStats, setUniversityStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUniversityStats = async () => {
    try {
      const [countsRes, avgGradeRes] = await Promise.all([
        api.get("/api/accounts/reports/university/counts/"),
        api.get("/api/accounts/reports/university/average-grade/")
      ]);

      setUniversityStats({
        studentsCount: countsRes.data.students_count,
        teachersCount: countsRes.data.teachers_count,
        averageGrade: avgGradeRes.data.average_grade
      });
    } catch (error) {
      console.error("Error fetching university stats:", error);
      console.error("Error details:", error.response?.data);
      toast.error(
        error.response?.data?.detail || "Failed to load university statistics"
      );
      // Set default values on error
      setUniversityStats({
        studentsCount: 0,
        teachersCount: 0,
        averageGrade: null
      });
    }
  };

  const fetchCourses = async () => {
    try {
      // For reports, fetch all available courses (not just enrolled)
      const coursesRes = await api.get("/api/courses/available/");
      console.log("Courses fetched:", coursesRes.data);

      if (!coursesRes.data || coursesRes.data.length === 0) {
        console.log("No courses found");
        setCourses([]);
        return;
      }

      const coursesWithStats = await Promise.all(
        coursesRes.data.map(async (course) => {
          try {
            const [completionRes, gradeRes] = await Promise.all([
              api.get(`/api/courses/reports/course/${course.id}/completion/`),
              api.get(`/api/courses/reports/course/${course.id}/average-grade/`)
            ]);

            return {
              ...course,
              completionStats: completionRes.data.metrics,
              gradeStats: gradeRes.data.metrics
            };
          } catch (error) {
            console.error(
              `Error fetching stats for course ${course.id}:`,
              error
            );
            return {
              ...course,
              completionStats: null,
              gradeStats: null
            };
          }
        })
      );

      console.log("Courses with stats:", coursesWithStats);
      setCourses(coursesWithStats);
    } catch (error) {
      console.error("Error fetching courses:", error);
      console.error("Error details:", error.response?.data);
      toast.error("Failed to load course data");
      setCourses([]);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await fetchUniversityStats();
      await fetchCourses();
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchAllData();
      toast.success("Reports refreshed successfully");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center pb-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cookie-brown"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="px-8 pt-6">
        {/* Back Button */}
        <div className="mb-4">
          <Link
            to="/"
            className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown hover:bg-cookie-brown"
          >
            <ArrowLeft className="size-5" /> Back
          </Link>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="font-bold text-4xl text-cookie-darkbrown">
              Reports
            </h1>
            <p className="text-gray-600 mt-2">
              University and course analytics overview
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn bg-cookie-brown text-cookie-white border border-cookie-brown hover:bg-cookie-darkbrown"
          >
            <RefreshCw
              className={`size-5 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh Data
          </button>
        </div>

        {/* University Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <UniversityStatsCard
            title="Total Students"
            value={universityStats?.studentsCount || 0}
            icon={<Users className="size-8 text-cookie-orange" />}
            bgColor="border-cookie-orange"
          />
          <UniversityStatsCard
            title="Total Teachers"
            value={universityStats?.teachersCount || 0}
            icon={<GraduationCap className="size-8 text-cookie-brown" />}
            bgColor="border-cookie-brown"
          />
          <UniversityStatsCard
            title="University Average Grade"
            value={
              universityStats?.averageGrade
                ? `${universityStats.averageGrade.toFixed(1)}%`
                : "N/A"
            }
            icon={<Award className="size-8 text-cookie-darkbrown" />}
            bgColor="border-cookie-darkbrown"
          />
        </div>

        {/* Course Reports Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="size-6 text-cookie-brown" />
            <h2 className="text-2xl font-bold text-cookie-darkbrown">
              Course Reports
            </h2>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="size-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No courses available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {courses.map((course) => (
                <CourseReportCard
                  key={course.id}
                  course={course}
                  totalStudents={universityStats?.studentsCount || 0}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// University Stats Card Component
const UniversityStatsCard = ({ title, value, icon, bgColor }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${bgColor}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-cookie-darkbrown mt-2">{value}</p>
      </div>
      <div className="opacity-80">{icon}</div>
    </div>
  </div>
);

// Course Report Card Component
const CourseReportCard = ({ course, totalStudents }) => {
  const completionPercent =
    course.completionStats?.average_completion_percent || 0;
  const averageGrade = course.gradeStats?.average_grade;
  const studentsCount = course.completionStats?.students_count || 0;
  const totalLessons = course.completionStats?.total_lessons || 0;

  // Calculate enrollment percentage (enrolled students / total students * 100)
  const enrollmentPercent =
    totalStudents > 0 ? (studentsCount / totalStudents) * 100 : 0;

  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-cookie-darkbrown mb-2">
            {course.title}
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            {studentsCount} students • {totalLessons} lessons
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500">Course ID</span>
          <p className="text-sm font-medium text-cookie-brown">{course.id}</p>
        </div>
      </div>

      {/* Enrollment Percentage */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Student Enrollment
          </span>
          <span className="text-lg font-bold text-cookie-orange">
            {enrollmentPercent.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-cookie-orange to-cookie-brown h-3 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(enrollmentPercent, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Average Grade */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">Average Grade</span>
        <div className="flex items-center gap-2">
          <Award className="size-4 text-cookie-brown" />
          <span className="text-lg font-bold text-cookie-brown">
            {averageGrade ? `${averageGrade.toFixed(1)}%` : "N/A"}
          </span>
        </div>
      </div>

      {/* Course Status Indicator */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Status</span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              course.status === "published"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {course.status || "Draft"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Reports;
