import AuthCard from "../components/AuthCard";
import AuthIllustration from "../components/AuthIllustration";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      <AuthIllustration />

      <section className="flex flex-1 items-center justify-center px-6 py-10">
        <AuthCard>
          <LoginForm />
        </AuthCard>
      </section>
    </div>
  );
}