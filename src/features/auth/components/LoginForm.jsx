import { Link, useLocation, useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { useState, useEffect } from "react";
import PasswordInput from "./PasswordInput";
import SocialLoginButtons from "./SocialLoginButtons";
import { useLogin } from "../hooks/useLogin";
import { validateLoginForm } from "../utils/authValidation";
import { mapLoginFormToRequest } from "../utils/authMapper";

export default function LoginForm() {
  const { login, isLoading, error } = useLogin();

  const [values, setValues] = useState({
    emailOrPhone: "",
    password: "",
    rememberMe: true,
  });

  const location = useLocation();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const message = location.state?.successMessage;
    if (!message) {
        return;
    }
    setSuccessMessage(message);
    
    navigate(location.pathname, { replace: true, state: null });
    
  }, []);

  const handleChange = (name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateLoginForm(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    await login(mapLoginFormToRequest(values));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-3xl font-bold text-gray-900">Welcome Back!</h2>

      {successMessage && (
        <div className="mt-5 rounded-xl bg-green-50 p-3 text-sm font-medium text-green-700">
          {successMessage}
        </div>
      )}

      <p className="mt-2 text-gray-500">Login to continue to your account</p>

      {error && (
        <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8">
        <label className="mb-2 block text-sm font-semibold text-gray-800">
          Email or Phone Number
        </label>

        <div className="relative">
          <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

          <input
            value={values.emailOrPhone}
            onChange={(e) => handleChange("emailOrPhone", e.target.value)}
            placeholder="Enter your email or phone number"
            className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100"
          />
        </div>

        {errors.emailOrPhone && (
          <p className="mt-1 text-sm text-red-600">{errors.emailOrPhone}</p>
        )}
      </div>

      <div className="mt-5">
        <PasswordInput
          value={values.password}
          onChange={(e) => handleChange("password", e.target.value)}
          error={errors.password}
        />
      </div>

      <div className="mt-5 flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={values.rememberMe}
            onChange={(e) => handleChange("rememberMe", e.target.checked)}
            className="h-4 w-4 accent-green-600"
          />
          Remember me
        </label>

        <Link
          to="/forgot-password"
          className="text-sm font-semibold text-green-600"
        >
          Forgot Password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-7 w-full rounded-xl bg-green-600 py-3 font-bold text-white shadow-lg shadow-green-200 hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Logging in..." : "Login"}
      </button>

      <div className="my-7 flex items-center gap-4">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-sm text-gray-400">or continue with</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <SocialLoginButtons />

      <p className="mt-7 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-semibold text-green-600">
          Sign Up
        </Link>
      </p>
    </form>
  );
}