import { Link } from "react-router-dom";
import AuthCard from "../components/AuthCard";

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <AuthCard>
        <h2 className="text-3xl font-bold text-gray-900">Verify Email</h2>

        <p className="mt-2 text-gray-500">
          Please enter the verification code sent to your email.
        </p>

        <form className="mt-8">
          <label className="mb-2 block text-sm font-semibold text-gray-800">
            Verification Code
          </label>

          <input
            placeholder="Enter code"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-center tracking-widest outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100"
          />

          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-green-600 py-3 font-bold text-white hover:bg-green-700"
          >
            Verify Email
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          <Link to="/login" className="font-semibold text-green-600">
            Back to Login
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}