import AuthCard from "../components/AuthCard";
import PasswordInput from "../components/PasswordInput";

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <AuthCard>
        <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>

        <p className="mt-2 text-gray-500">Create a new secure password.</p>

        <form className="mt-8 space-y-5">
          <PasswordInput value="" onChange={() => {}} placeholder="New password" />

          <PasswordInput
            value=""
            onChange={() => {}}
            placeholder="Confirm password"
          />

          <button
            type="submit"
            className="w-full rounded-xl bg-green-600 py-3 font-bold text-white hover:bg-green-700"
          >
            Reset Password
          </button>
        </form>
      </AuthCard>
    </div>
  );
}