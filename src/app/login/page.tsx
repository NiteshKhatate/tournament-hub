import LoginForm from '@/components/login/LoginForm';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-app-bg px-4">
      <div className="max-w-md rounded-2xl bg-white p-10 shadow-xl">
        <h1 className="mb-2 text-center font-semibold text-app-text">
          Welcome Back
        </h1>
        <p className="mb-10 text-center text-sm text-gray-500">
          Sign in to manage your tournaments
        </p>
        <LoginForm />
      </div>
    </main>
  );
}