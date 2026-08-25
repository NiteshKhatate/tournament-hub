import RegisterPlayerForm from "@/components/register/RegisterPlayerForm";

export default function RegisterPlayerPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-app-bg px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">
        <h1 className="text-app-text">Player Registration</h1>
        <p className="mt-1 text-sm text-gray-500">Register as a player</p>

        <div className="mt-8">
          <RegisterPlayerForm />
        </div>
      </div>
    </div>
  );
}
