import Form from "../components/Form";
import Logo from "../assets/images/logo_background_removed.png";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

const SignUp = () => {
  return (
    <div className="min-h-screen w-full relative">
      <div className="absolute top-8 left-8">
        <Link
          to={"/landing"}
          className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown"
        >
          <ArrowLeft className="size-5" />
          Back to Landing
        </Link>
      </div>
      <div className="w-full flex items-center justify-center p-4">
        <div className="p-10 flex flex-col gap-4 mt-12 ml-24">
          <h1 className="text-cookie-darkbrown text-6xl font-bold lg:max-w-4xl md:max-w-xl">
            Welcome to Cookie University! 🍪
          </h1>
          <p className="text-cookie-darkbrown text-xl lg:max-w-2xl md:max-w-md">
            Join our Learning Management System (LMS) to start your learning
            journey.
          </p>
          <p className="text-cookie-darkbrown text-xl lg:max-w-2xl md:max-w-md">
            Students: Access interactive lessons, track your progress, and earn
            achievements.
          </p>
          <p className="text-cookie-darkbrown text-xl lg:max-w-2xl md:max-w-md">
            Teachers: Create engaging courses, manage students, and share your
            expertise.
          </p>
          <p className="text-cookie-darkbrown text-xl lg:max-w-2xl md:max-w-md">
            Choose your role below to get started — the ceiling is the limit! 🚀
          </p>
          <img
            src={Logo}
            alt="Cookie University Logo"
            className="w-64 lg:w-80 h-auto flex-shrink-0"
          />
        </div>
        <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8">
          <div className="w-full max-w-md lg:max-w-lg flex-shrink-0">
            <Form isSignUp={true} route="api/accounts/register/" />
          </div>
        </div>
      </div>
    </div>
  );
};
export default SignUp;
