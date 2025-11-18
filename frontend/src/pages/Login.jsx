import Form from "../components/Form";
import Logo from "../assets/images/logo_background_removed.png";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

const Login = () => {
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
        <div className="p-10 flex flex-col gap-4 mt-12 ml-20">
          <h1 className="text-cookie-darkbrown text-6xl font-bold lg:max-w-4xl md:max-w-xl">
            Welcome Back to Cookie University! 🍪
          </h1>
          <p className="text-cookie-darkbrown text-xl lg:max-w-2xl md:max-w-md">
            Log in to continue your learning journey.
          </p>
          <p className="text-cookie-darkbrown text-xl lg:max-w-2xl md:max-w-md">
            Don’t have an account yet?
          </p>
          <p className="text-cookie-darkbrown text-xl lg:max-w-2xl md:max-w-md">
            Sign up for an account from the landing page to join Cookie
            University today — the ceiling is the limit! 🚀
          </p>
          <img
            src={Logo}
            alt="Cookie University Logo"
            className="w-64 lg:w-80 h-auto flex-shrink-0"
          />
        </div>
        <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8">
          <div className="w-full max-w-md lg:max-w-lg flex-shrink-0 mr-36">
            <Form isSignUp={false} route="api/accounts/login/" />
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
