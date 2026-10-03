import { Link, useNavigate } from "react-router-dom";
import { Mail, Phone, User } from "lucide-react";
import { useState } from "react";
import PasswordInput from "./PasswordInput";
import { validateRegisterForm } from "../utils/authValidation";
import { mapRegisterFormToRequest } from "../utils/authMapper";
import { authApi } from "../api/authApi";

export default function RegisterForm() {
  const [values, setValues] = useState({
    phone: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateRegisterForm(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      setIsLoading(true);
      setServerError("");

      await authApi.register(mapRegisterFormToRequest(values));
      navigate("/login", {
        state: {
            successMessage: "Registration successful! Please log in.",
        },
      });
    } catch (err) {
      setServerError(
        err.response?.data?.error || err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>

      <p className="mt-2 text-gray-500">
        Join HyperLocalMarket and start shopping locally.
      </p>

      {serverError && (
        <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {serverError}
        </div>
      )}


      {/* <InputField
        label="Full Name"
        icon={<User />}
        value={values.fullName}
        error={errors.fullName}
        placeholder="Enter your full name"
        onChange={(e) => handleChange("fullName", e.target.value)}
      /> */}

      <InputField
        label="Email"
        icon={<Mail />}
        value={values.email}
        error={errors.email}
        placeholder="Enter your email"
        onChange={(e) => handleChange("email", e.target.value)}
      />

      <InputField
        label="Phone"
        icon={<Phone />}
        value={values.phone}
        error={errors.phone}
        placeholder="Enter your phone number"
        onChange={(e) => handleChange("phone", e.target.value)}
      />

      <div className="mt-5">
        <PasswordInput
          value={values.password}
          onChange={(e) => handleChange("password", e.target.value)}
          error={errors.password}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-7 w-full rounded-xl bg-green-600 py-3 font-bold text-white hover:bg-green-700 disabled:opacity-60"
      >
        {isLoading ? "Creating account..." : "Create Account"}
      </button>

      <p className="mt-7 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-green-600">
          Login
        </Link>
      </p>
    </form>
  );
}

function InputField({ label, icon, value, onChange, placeholder, error }) {
  return (
    <div className="mt-5">
      <label className="mb-2 block text-sm font-semibold text-gray-800">
        {label}
      </label>

      <div className="relative">
        <span className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400">
          {icon}
        </span>

        <input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100"
        />
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}