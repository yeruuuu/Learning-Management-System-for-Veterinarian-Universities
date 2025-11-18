import {
  Mail,
  Phone,
  MessageCircle,
  HelpCircle,
  Book,
  Users,
  PawPrint,
  ShieldCheck,
  AlertTriangle,
  BookOpenCheck,
  Clock,
  FileWarning,
  Link
} from "lucide-react";

const Help = () => {
  return (
    <div className="min-h-screen pb-12">
      <div className="px-8 pt-8">
        <h1 className="font-bold text-4xl text-cookie-darkbrown mb-2">
          Help & Support
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          We're here to help! Find answers to common questions or get in touch
          with our support team.
        </p>

        {/* Contact Support Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-cookie-orange">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="size-7 text-cookie-orange" />
            <h2 className="text-2xl font-bold text-cookie-darkbrown">
              Contact Support
            </h2>
          </div>
          <p className="text-gray-700 mb-4">
            Need assistance with technical issues, account problems, or have
            questions about using Pawgress? Our support team is ready to help
            you.
          </p>
          <div className="space-y-3 ml-4">
            <div className="flex items-center gap-3">
              <Mail className="size-5 text-cookie-brown" />
              <div>
                <span className="font-medium text-gray-700">Email: </span>
                <a
                  href="mailto:support@pawgress.edu"
                  className="text-cookie-brown hover:underline"
                >
                  support@pawgress.edu
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="size-5 text-cookie-brown" />
              <div>
                <span className="font-medium text-gray-700">Phone: </span>
                <span className="text-gray-900">+61 467 416 767</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <HelpCircle className="size-5 text-cookie-brown" />
              <div>
                <span className="font-medium text-gray-700">
                  Support Hours:{" "}
                </span>
                <span className="text-gray-900">
                  Monday - Friday, 9:00 AM - 5:00 PM AEST
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Support Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-cookie-brown">
          <div className="flex items-center gap-3 mb-4">
            <Book className="size-7 text-cookie-brown" />
            <h2 className="text-2xl font-bold text-cookie-darkbrown">
              Academic Support
            </h2>
          </div>
          <p className="text-gray-700 mb-4">
            Need help with your studies or teaching? Our academic support team
            is here to assist you with course-related questions and learning
            resources.
          </p>
          <div className="space-y-3 ml-4">
            <div className="flex items-center gap-3">
              <Mail className="size-5 text-cookie-brown" />
              <div>
                <span className="font-medium text-gray-700">Email: </span>
                <a
                  href="mailto:academic@pawgress.edu"
                  className="text-cookie-brown hover:underline"
                >
                  academic@pawgress.edu
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="size-5 text-cookie-brown" />
              <div>
                <span className="font-medium text-gray-700">
                  Office Hours:{" "}
                </span>
                <span className="text-gray-900">
                  Monday - Thursday, 10:00 AM - 4:00 PM AEST
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pet Lesson Guidelines (for Teachers) */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-cookie-orange">
          <div className="flex items-center gap-3 mb-2">
            <PawPrint className="size-7 text-cookie-orange" />
            <h2 className="text-2xl font-bold text-cookie-darkbrown">
              Pet Lesson Guidelines (for Teachers)
            </h2>
          </div>
          <p className="text-gray-700 mb-5">
            Use these guidelines when creating and delivering lessons related to
            pets. Content must prioritise animal welfare and respect for pet
            owners.
          </p>

          {/* What’s Appropriate */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-cookie-cream rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-2">
                <BookOpenCheck className="size-5 text-cookie-brown" />
                <h3 className="font-semibold text-cookie-darkbrown">
                  What’s Appropriate
                </h3>
              </div>
              <ul className="list-disc ml-5 space-y-2 text-gray-700">
                <li>Responsible ownership: identification, registration, microchipping, and desexing.</li>
                <li>Welfare-first care: nutrition, enrichment, exercise, hygiene, and safe housing.</li>
                <li>Reading body language and stress signals; knowing when to disengage.</li>
                <li>Positive reinforcement training; avoid aversive methods.</li>
                <li>Safety in public: leashes, secure transport, clean-up etiquette, local laws.</li>
                <li>Respect for owners’ privacy and circumstances; cultural sensitivity.</li>
              </ul>
            </div>

            {/* Not Appropriate */}
            <div className="bg-red-50 rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="size-5 text-red-600" />
                <h3 className="font-semibold text-cookie-darkbrown">
                  Not Appropriate
                </h3>
              </div>
              <ul className="list-disc ml-5 space-y-2 text-gray-700">
                <li>Content that encourages harm, fear, or distress to animals.</li>
                <li>Aversive techniques (e.g., shock, alpha rolls, intimidation).</li>
                <li>Unsafe handling, illegal ownership, or glamorising risky breeding practices.</li>
                <li>Medical diagnosis or treatment advice (refer to a licensed veterinarian).</li>
                <li>Collecting owner/household data beyond learning needs or without consent.</li>
              </ul>
            </div>
          </div>

          {/* Delivery Requirements */}
          <div className="mt-6 grid md:grid-cols-3 gap-6">
            <div className="rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="size-5 text-cookie-brown" />
                <h3 className="font-semibold text-cookie-darkbrown">
                  Delivery Requirements
                </h3>
              </div>
              <ul className="list-disc ml-5 space-y-2 text-gray-700">
                <li>Keep each lesson to a 2–4 week scope with clear objectives.</li>
                <li>Use links to reputable sources (no file downloads).</li>
                <li>Note effort level and estimated time to complete.</li>
              </ul>
            </div>

            <div className="rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="size-5 text-cookie-brown" />
                <h3 className="font-semibold text-cookie-darkbrown">
                  Safety & Consent
                </h3>
              </div>
              <ul className="list-disc ml-5 space-y-2 text-gray-700">
                <li>No live animal demonstrations without approved risk controls.</li>
                <li>Hygiene protocols for any in-person activities.</li>
                <li>Obtain consent for any photos/videos or case studies.</li>
              </ul>
            </div>

            <div className="rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-2">
                <FileWarning className="size-5 text-cookie-brown" />
                <h3 className="font-semibold text-cookie-darkbrown">
                  Compliance
                </h3>
              </div>
              <ul className="list-disc ml-5 space-y-2 text-gray-700">
                <li>Follow local animal welfare laws and campus policies.</li>
                <li>Respect accessibility needs (captions, alt text, readable layouts).</li>
                <li>Avoid breed stereotypes; focus on individual care and behaviour.</li>
              </ul>
            </div>
          </div>

          {/* Quick Checklist */}
          <div className="mt-6">
            <h3 className="font-semibold text-cookie-darkbrown mb-2">
              Quick Checklist (Before Publishing)
            </h3>
            <ul className="list-disc ml-5 space-y-2 text-gray-700">
              <li>Objectives, duration (2–4 weeks), effort level are clearly stated.</li>
              <li>Links to reputable sources included; no downloadable files.</li>
              <li>Content promotes welfare-first, positive, and safe practices.</li>
              <li>No personal/owner data collected without clear consent and purpose.</li>
              <li>All classroom activities have risk controls and approvals if required.</li>
            </ul>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-cookie-orange">
          <h2 className="text-2xl font-bold text-cookie-darkbrown mb-4">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg text-cookie-darkbrown mb-2">
                How do I enroll in a course?
              </h3>
              <p className="text-gray-700 ml-4">
                Navigate to the home page and browse available courses. Click on
                a course to view details, then click the "Enroll" button to join
                the course.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg text-cookie-darkbrown mb-2">
                How do I track my progress?
              </h3>
              <p className="text-gray-700 ml-4">
                Click on any course you're enrolled in to view your progress
                bar, which shows your completion percentage and credits earned.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg text-cookie-darkbrown mb-2">
                How do I complete a lesson?
              </h3>
              <p className="text-gray-700 ml-4">
                Access the lessons page for your course, click on a lesson to
                view its content, and mark it as complete when you've finished
                studying the material.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg text-cookie-darkbrown mb-2">
                I forgot my password. What should I do?
              </h3>
              <p className="text-gray-700 ml-4">
                On the login page, click "Forgot Password" and follow the
                instructions to reset your password via email.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg text-cookie-darkbrown mb-2">
                How do teachers create courses and lessons?
              </h3>
              <p className="text-gray-700 ml-4">
                Teachers can create new courses from the home page by clicking
                "Create Course". Once a course is created, navigate to the
                course and use the "Lessons" section to add new lesson content.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg text-cookie-darkbrown mb-2">
                Can I access courses on mobile devices?
              </h3>
              <p className="text-gray-700 ml-4">
                Yes! Pawgress is fully responsive and works on smartphones,
                tablets, and desktop computers. Simply access the platform
                through your mobile browser.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Help;
