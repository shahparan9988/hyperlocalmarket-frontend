import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";

export default function PasswordInput({
  value,
  onChange,
  error,
  placeholder = "Enter your password",
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-800">
        Password
      </label>

      <div className="relative">
        <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-12 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100"
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}