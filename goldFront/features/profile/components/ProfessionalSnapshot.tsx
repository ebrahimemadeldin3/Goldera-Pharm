"use client";

import {
  Award,
  CalendarDays,
  FileCheck2,
  GraduationCap,
  History,
  IdCard,
  RefreshCw,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import {
  cn,
  formatSaudiDateDisplay,
  formatSaudiDateTimeDisplay,
} from "@/lib/utils";
import { UserProfile } from "../lib/types";
import { profileCardClass } from "../lib/utils";
import { useInView } from "../lib/use-in-view";

type SnapshotItem = {
  label: string;
  value: string;
  active: boolean;
  icon: typeof GraduationCap;
};

function formatDate(value?: string | null, withTime = false): string {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return withTime
    ? formatSaudiDateTimeDisplay(date)
    : formatSaudiDateDisplay(date);
}

export default function ProfessionalSnapshot({
  profile,
}: {
  profile: UserProfile;
}) {
  const { ref, visible } = useInView<HTMLElement>(0.22);
  const certificatesCount = profile.certificates?.length ?? 0;

  const snapshotItems: SnapshotItem[] = [
    {
      label: "Education",
      value: profile.educationBackground?.trim()
        ? profile.educationBackground.trim()
        : "Not specified",
      active: Boolean(profile.educationBackground?.trim()),
      icon: GraduationCap,
    },
    {
      label: "Certificates",
      value:
        certificatesCount > 0
          ? `${certificatesCount} uploaded`
          : "No certificates",
      active: certificatesCount > 0,
      icon: Award,
    },
    {
      label: "Resume",
      value: profile.resume?.trim() ? "Uploaded" : "Not uploaded",
      active: Boolean(profile.resume?.trim()),
      icon: FileCheck2,
    },
    {
      label: "Identity",
      value:
        profile.iqamaNumber?.trim() || profile.passportNumber?.trim()
          ? "Documented"
          : "Pending",
      active: Boolean(
        profile.iqamaNumber?.trim() || profile.passportNumber?.trim(),
      ),
      icon: IdCard,
    },
  ];

  const timeline = [
    {
      label: "Joined",
      value: formatDate(profile.dateOfRecruitment),
      icon: CalendarDays,
    },
    {
      label: "Profile Created",
      value: formatDate(profile.createdAt, true),
      icon: UserPlus,
    },
    {
      label: "Last Updated",
      value: formatDate(profile.updatedAt, true),
      icon: RefreshCw,
    },
    {
      label: "Last Login",
      value: formatDate(profile.lastLogin, true),
      icon: History,
    },
  ];

  return (
    <section
      ref={ref}
      aria-label="Professional snapshot"
      className={cn(
        `${profileCardClass} overflow-hidden`,
        "profile-inview",
        visible && "profile-inview-visible",
      )}
      style={{ transitionDelay: "70ms" } as React.CSSProperties}
    >
      <div className="border-secondary-light via-gold-50/60 to-light-blue/60 border-b bg-linear-to-r from-white px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-brand-navy text-sm font-semibold">
              Professional Snapshot
            </h3>
            <p className="text-secondary-text mt-1 text-xs">
              Credentials, documents and lifecycle markers
            </p>
          </div>
          <span className="text-brand-navy ring-secondary-light inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium ring-1 ring-inset">
            <ShieldCheck className="text-gold-600 size-3.5" aria-hidden />
            HR record
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
        <div className="p-6">
          <h4 className="text-secondary-text text-xs font-semibold tracking-wide uppercase">
            Credential Signals
          </h4>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {snapshotItems.map((item, index) => (
              <div
                key={item.label}
                className={cn(
                  "profile-signal-item rounded-lg border px-4 py-3",
                  item.active
                    ? "border-gold-300/50 bg-gold-50/70"
                    : "border-secondary-light bg-secondary-very-light",
                )}
                style={
                  {
                    "--profile-delay": `${90 + index * 60}ms`,
                  } as React.CSSProperties
                }
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-lg",
                      item.active
                        ? "gradient-gold text-white"
                        : "text-secondary-text ring-secondary-light bg-white ring-1 ring-inset",
                    )}
                  >
                    <item.icon className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-secondary-text text-xs font-medium">
                      {item.label}
                    </p>
                    <p className="text-brand-navy mt-1 text-sm leading-5 font-semibold break-words">
                      {item.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-secondary-light border-t p-6 lg:border-t-0 lg:border-l">
          <h4 className="text-secondary-text text-xs font-semibold tracking-wide uppercase">
            Account Timeline
          </h4>
          <ol className="profile-timeline mt-4 space-y-4">
            {timeline.map((item, index) => (
              <li
                key={item.label}
                className="profile-timeline-item relative flex gap-3 pl-1"
                style={
                  {
                    "--profile-delay": `${110 + index * 70}ms`,
                  } as React.CSSProperties
                }
              >
                <span className="profile-timeline-dot text-gold-600 ring-gold-300/60 relative z-10 mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-inset">
                  <item.icon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="text-secondary-text block text-xs font-medium">
                    {item.label}
                  </span>
                  <span className="text-brand-navy mt-1 block text-sm leading-5 font-semibold break-words">
                    {item.value}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
