export default function AuthCard({ children }) {
    return (
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl shadow-green-100">
            {children}
        </div>
    );
}