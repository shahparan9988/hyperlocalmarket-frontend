export default function SocialLoginButtons() {
  return (
    <div className="space-y-3">
      <button
        type="button"
        className="w-full rounded-xl border border-gray-300 py-3 font-semibold text-gray-700 hover:bg-gray-50"
      >
        Continue with Google
      </button>

      <button
        type="button"
        className="w-full rounded-xl border border-gray-300 py-3 font-semibold text-gray-700 hover:bg-gray-50"
      >
        Continue with Facebook
      </button>

      <button
        type="button"
        className="w-full rounded-xl border border-gray-300 py-3 font-semibold text-gray-700 hover:bg-gray-50"
      >
        Continue with Apple
      </button>
    </div>
  );
}