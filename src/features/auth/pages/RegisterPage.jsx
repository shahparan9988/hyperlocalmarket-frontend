import AuthCard from "../components/AuthCard";
import AuthIllustration from "../components/AuthIllustration";
import RegisterForm from "../components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen">
      <AuthIllustration />

      <section className="flex flex-1 items-center justify-center px-6 py-10">
        <AuthCard>
          <RegisterForm />
        </AuthCard>
      </section>
    </div>
  );
}