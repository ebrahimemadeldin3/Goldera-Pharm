import { LoginForm } from "@/features/auth/components/LoginForm";

export default function Page() {
  return (
    <main className="flex h-screen flex-col items-center justify-center bg-linear-to-b from-[#0F172A] to-[#1E3A8A]">
      <LoginForm />

      <div className="mt-8 w-full max-w-5xl text-center">
        <div className="flex items-center justify-center gap-6">
          <div className="border-secondary-very-light flex w-[200px] items-center justify-center gap-2 rounded-[100] border bg-[#FFFFFF] px-6 py-2">
            <span className="bg-dashboard-green inline-block h-2 w-2 rounded-full" />
            <span className="text-[15px] text-[#475569]">Secure Access</span>
          </div>
          <div className="border-secondary-very-light flex w-[200px] items-center justify-center gap-2 rounded-[100] border bg-[#FFFFFF] px-6 py-2">
            <span className="bg-dashboard-blue inline-block h-2 w-2 rounded-full" />
            <span className="text-[15px] text-[#475569]">Real-time Data</span>
          </div>
          <div className="border-secondary-very-light flex w-[200px] items-center justify-center gap-2 rounded-[100] border bg-[#FFFFFF] px-6 py-2">
            <span className="bg-gold inline-block h-2 w-2 rounded-full" />
            <span className="text-[15px] text-[#475569]">24/7 Support</span>
          </div>
        </div>
        <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-sm text-white/80">
          Goldera Pharmaceuticals CRM System v2.0
          <br />© 2025 All rights reserved
        </p>
      </div>
    </main>
  );
}
