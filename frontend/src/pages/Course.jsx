import { useContext, useState, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router";
import { RoleContext } from "../contexts/RoleContext";
import { ArrowLeft, PawPrint } from "lucide-react";
import api from "../api";

const Course = () => {
  const { courseid } = useParams();
  const { role } = useContext(RoleContext);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseData, setCourseData] = useState(null);
  const [gpaData, setGpaData] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/api/courses/${courseid}/`);
        setCourseTitle(res.data?.title || "");
        setCourseData(res.data);
      } catch (error) {
        setCourseTitle("");
        setCourseData(null);
      }
    };
    if (courseid) fetchCourse();
  }, [courseid]);

  // Fetch GPA for students
  useEffect(() => {
    const fetchGPA = async () => {
      if (role !== "student") return;

      try {
        const res = await api.get(`/api/lessons/course/${courseid}/gpa/`);
        setGpaData(res.data);
      } catch (error) {
        console.error("Failed to fetch GPA:", error);
        setGpaData(null);
      }
    };
    if (courseid) fetchGPA();
  }, [courseid, role]);

  const backLink = useMemo(() => {
    return "/";
  }, []);

  return (
    <div className="min-h-screen pb-12">
      <div className="ml-8 mt-2">
        <Link
          to={backLink}
          className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown"
        >
          <ArrowLeft className="size-5" />
          Back
        </Link>
      </div>
      {courseTitle && (
        <h2 className="font-bold text-4xl pl-8 pt-4">{courseTitle}</h2>
      )}
      <div className="flex flex-col items-start mt-8 pl-8">
        <div className="flex gap-4 justify-start">
          <Link
            to={`/lesson/course/${courseid}`}
            className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown px-6 py-3 text-base font-semibold rounded-lg shadow"
          >
            Lessons
          </Link>
          <Link
            to={`/classroom/course/${courseid}`}
            className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown px-6 py-3 text-base font-semibold rounded-lg shadow"
          >
            Classrooms
          </Link>
          {role === "teacher" && (
            <Link
              to={`/course/${courseid}/students`}
              className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown px-6 py-3 text-base font-semibold rounded-lg shadow"
            >
              Student List
            </Link>
          )}
          {role === "student" && (
            <Link
              to={`/course/${courseid}/grades`}
              className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown px-6 py-3 text-base font-semibold rounded-lg shadow"
            >
              My Grades
            </Link>
          )}
        </div>
      </div>

      {/* Course Overview Section with Progress Bar */}
      <div className="mt-12 px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Course Overview - Left side (1/2 width) */}
          <div className="lg:col-span-1">
            <h3 className="font-bold text-2xl mb-4 text-cookie-darkbrown">
              Course Overview
            </h3>
            <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
              <p className="text-gray-700 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                Excepteur sint occaecat cupidatat non proident, sunt in culpa
                qui officia deserunt mollit anim id est laborum. Sed ut
                perspiciatis unde omnis iste natus error sit voluptatem
                accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
                quae ab illo inventore veritatis et quasi architecto beatae
                vitae dicta sunt explicabo.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit
                aut fugit, sed quia consequuntur magni dolores eos qui ratione
                voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem
                ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia
                non numquam eius modi tempora incidunt ut labore et dolore
                magnam aliquam quaerat voluptatem.
              </p>
            </div>
          </div>

          {/* Progress Bar - Right side (1/2 width) - Only show for students */}
          {role === "student" && courseData && (
            <div className="lg:col-span-1">
              <h3 className="font-bold text-2xl mb-4 text-cookie-darkbrown">
                Your Progress
              </h3>
              <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200 flex flex-col justify-center items-center min-h-[500px]">
                <div className="flex flex-col gap-4 w-full">
                  {/* GPA Section */}
                  {gpaData && gpaData.gpa !== null && (
                    <div className="text-center pb-4 border-b-2 border-cookie-cream">
                      <div className="text-5xl font-bold text-cookie-brown mb-1">
                        {gpaData.gpa.toFixed(2)}
                      </div>
                      <div className="text-lg text-cookie-darkbrown font-medium mb-1">
                        Course GPA
                      </div>
                      <div className="text-sm text-gray-600">
                        {gpaData.graded_lessons_count} of{" "}
                        {gpaData.total_lessons_count} lessons graded
                      </div>
                    </div>
                  )}

                  <div className="text-center">
                    <div className="text-6xl font-bold text-cookie-orange mb-2">
                      {courseData.progress_percentage || 0}%
                    </div>
                    <div className="text-xl text-cookie-darkbrown font-medium">
                      Complete
                    </div>
                  </div>

                  {/* Paw Print Shaped Progress Bar */}
                  <div className="relative w-full flex justify-center py-4">
                    <div className="relative w-64 h-64">
                      {/* Background paw print (cream outline with white fill) */}
                      <PawPrint
                        className="absolute inset-0 w-full h-full text-cookie-cream fill-white"
                        strokeWidth={1.5}
                      />

                      {/* Progress paw print fill (orange) - fills from bottom to top */}
                      <div
                        className="absolute inset-0 overflow-hidden transition-all duration-300"
                        style={{
                          clipPath: `inset(${
                            100 - (courseData.progress_percentage || 0)
                          }% 0 0 0)`
                        }}
                      >
                        <PawPrint
                          className="w-full h-full text-cookie-cream fill-cookie-orange"
                          strokeWidth={1.5}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-4xl font-semibold text-cookie-brown mb-2">
                      {courseData.completed_credits || 0}/
                      {courseData.total_credits || 0}
                    </div>
                    <div className="text-xl text-cookie-darkbrown">
                      credits earned
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Information Section */}
      <div className="mt-8 px-8 max-w-7xl pb-8">
        <h3 className="font-bold text-2xl mb-4 text-cookie-darkbrown">
          Additional Information
        </h3>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="space-y-6">
            {/* Contact Support */}
            <div>
              <h4 className="font-semibold text-lg text-cookie-darkbrown mb-2">
                Contact for Support
              </h4>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions or need assistance with this course,
                please reach out to our support team:
              </p>
              <ul className="mt-2 ml-6 text-gray-700 space-y-1">
                <li className="list-disc">
                  Email:{" "}
                  <a
                    href="mailto:support@pawgress.edu"
                    className="text-cookie-brown hover:underline"
                  >
                    support@pawgress.edu
                  </a>
                </li>
                <li className="list-disc">Phone: +61 467 416 767</li>
                <li className="list-disc">
                  Office Hours: Monday - Friday, 9:00 AM - 5:00 PM
                </li>
              </ul>
            </div>

            {/* Additional Education Resources */}
            <div>
              <h4 className="font-semibold text-lg text-cookie-darkbrown mb-2">
                Additional Education Resources
              </h4>
              <p className="text-gray-700 leading-relaxed">
                Enhance your learning experience with these recommended
                resources:
              </p>
              <ul className="mt-2 ml-6 text-gray-700 space-y-1">
                <li className="list-disc">
                  Access our online library for supplementary materials and
                  reading lists
                </li>
                <li className="list-disc">
                  Join study groups and discussion forums to collaborate with
                  peers
                </li>
                <li className="list-disc">
                  Schedule one-on-one tutoring sessions with course instructors
                </li>
                <li className="list-disc">
                  Explore related courses and certifications to advance your
                  skills
                </li>
              </ul>
            </div>

            {/* Technical Support */}
            <div>
              <h4 className="font-semibold text-lg text-cookie-darkbrown mb-2">
                Technical Support
              </h4>
              <p className="text-gray-700 leading-relaxed">
                For technical issues with the platform or accessing course
                materials, please contact our IT helpdesk at{" "}
                <a
                  href="mailto:techsupport@pawgress.edu"
                  className="text-cookie-brown hover:underline"
                >
                  techsupport@pawgress.edu
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Course;
