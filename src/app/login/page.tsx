import LoginForm from '@/components/login/LoginForm';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-app-bg px-4">
      <div className="rounded-2xl bg-white p-10 shadow-xl">
        <LoginForm />
      </div>
    </main>
  );
}