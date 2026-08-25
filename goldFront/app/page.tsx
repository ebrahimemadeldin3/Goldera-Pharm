import Image from "next/image";
import {
  BarChart3,
  MapPinned,
  PackageSearch,
  TrendingUp,
} from "lucide-react";
import type { CSSProperties } from "react";
import { LoginForm } from "@/features/auth/components/LoginForm";

const brandFeatures = [
  {
    label: "Field Operations",
    description:
      "Manage visits, plans, doctors and pharmacies across your field teams.",
    icon: MapPinned,
  },
  {
    label: "Sales & Products",
    description:
      "Track sales activity and manage your pharmaceutical product portfolio.",
    icon: PackageSearch,
  },
  {
    label: "Forecasting",
    description:
      "Plan product distribution and submit forecasts for management approval.",
    icon: TrendingUp,
  },
  {
    label: "Performance & Reports",
    description: "Monitor teams, coaching, appraisals and operational reports.",
    icon: BarChart3,
  },
];

function GolderaLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`auth-logo flex shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-white/10 bg-white/95 shadow-[0_10px_24px_rgba(0,0,0,0.18)] ${
        compact ? "size-10" : "size-11"
      }`}
    >
      <Image
        src={"/logos/logo.webp"}
        width={compact ? 34 : 36}
        height={compact ? 39 : 42}
        alt={"GolderaPharm"}
        priority
      />
    </div>
  );
}

function BrandFeatures() {
  return (
    <div className="mt-9 hidden gap-7 sm:grid">
      {brandFeatures.map((item, index) => {
        const Icon = item.icon;

        return (
          <div
            key={item.label}
            className="auth-feature-row flex gap-4"
            style={{ "--auth-delay": `${100 + index * 50}ms` } as CSSProperties}
          >
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg text-[#8595AC]">
              <Icon className="size-[17px]" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-[15px] font-semibold text-[#F7F9FC]">
                {item.label}
              </h3>
              <p className="mt-1 max-w-[360px] text-[13px] leading-5 text-[#AAB4C3]">
                {item.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Page() {
  return (
    <main className="auth-screen relative isolate flex min-h-dvh min-h-screen items-center justify-center overflow-x-hidden px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="auth-shell relative z-10 grid overflow-hidden rounded-[24px] border border-white/[0.075] shadow-[0_28px_80px_rgba(4,10,24,0.36)] lg:grid-cols-[52fr_48fr]">
        <section className="auth-brand-panel relative flex min-h-[220px] flex-col justify-between bg-[#17243B] p-6 sm:min-h-[330px] sm:p-8 lg:min-h-[620px] lg:p-10 xl:p-12">
          <div>
            <div className="flex items-center gap-3">
              <GolderaLogo compact />
              <p className="text-[12px] font-semibold text-[#AAB4C3]">
                GOLDERAPHARM
              </p>
            </div>

            <h1 className="mt-6 text-[30px] leading-tight font-semibold text-[#F7F9FC] sm:text-[34px] lg:mt-7 lg:text-[34px]">
              Pharmaceutical CRM
            </h1>

            <p className="mt-5 max-w-[430px] text-[16px] leading-7 text-[#D7DDE7]">
              A centralized workspace for pharmaceutical field operations,
              sales management, forecasting and team performance.
            </p>

            <BrandFeatures />
          </div>

          <p className="mt-8 text-[11px] font-medium text-[#6F7B8F]">
            Goldera Pharmaceuticals CRM System v2.0
          </p>
        </section>

        <section
          aria-label="Sign in"
          className="auth-login-panel flex min-h-[430px] items-center justify-center border-t border-white/[0.07] bg-[#202A3A] px-6 py-9 sm:px-8 lg:min-h-[620px] lg:border-t-0 lg:border-l lg:border-white/[0.07] lg:px-10 xl:px-12"
        >
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
