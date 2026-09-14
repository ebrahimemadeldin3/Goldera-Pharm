"use client";

import { useMemo, useState, useTransition, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import {
  AlignLeft,
  BriefcaseBusiness,
  Building2,
  CalendarCheck2,
  GraduationCap,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatSaudiMonthYear } from "@/lib/utils";
import { UserProfile } from "../lib/types";
import { updateProfileAction } from "../api";
import { formatRole, profileCardClass } from "../lib/utils";
import { InfoField, MutedValue } from "./InfoField";

type PersonalInformationProps = {
  profile: UserProfile;
  editing: boolean;
  onEditingChange: (editing: boolean) => void;
  variant?: "standard" | "manager";
};

type ProfileFormState = {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
};

const inputClass =
  "mt-1.5 h-9 w-full rounded-lg border-[#E5E8EF] bg-[#F6F8FB] text-sm text-[#182033] shadow-none transition-[border-color,box-shadow] placeholder:text-[#667085] focus-visible:border-gold-300 focus-visible:ring-gold-300/30";

const managerInputClass =
  "h-10 w-full rounded-[10px] border-gp-border-control bg-gp-surface-card text-sm font-medium text-gp-navy-900 shadow-none transition-[border-color,box-shadow,background-color] duration-[170ms] placeholder:text-gp-text-placeholder focus-visible:border-gp-gold-500 focus-visible:ring-gp-gold-500/15";

type ManagerInfoCellProps = {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  accent?: "gold" | "navy" | "green" | "slate";
  href?: string;
  span?: boolean;
};

const managerAccentClass = {
  gold: "manager-profile-icon-container-gold",
  navy: "manager-profile-icon-container-navy",
  green: "manager-profile-icon-container-green",
  slate: "manager-profile-icon-container-neutral",
} satisfies Record<NonNullable<ManagerInfoCellProps["accent"]>, string>;

function ManagerInfoCell({
  label,
  value,
  icon: Icon,
  accent = "navy",
  href,
  span,
}: ManagerInfoCellProps) {
  const content = (
    <div className="flex min-w-0 items-start gap-3">
      <span
        className={`manager-profile-info-icon mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-[10px] border ${managerAccentClass[accent]}`}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-gp-text-muted text-[11px] font-semibold tracking-[0.04em] uppercase">
          {label}
        </p>
        <div className="text-gp-navy-900 mt-1 text-sm leading-6 font-semibold break-words">
          {value}
        </div>
      </div>
    </div>
  );

  const className = cn(
    "manager-profile-info-cell group min-w-0 p-4 transition-[background-color,transform] duration-[170ms]",
    span && "sm:col-span-2",
  );

  return href ? (
    <a href={href} className={className}>
      {content}
    </a>
  ) : (
    <div className={className}>{content}</div>
  );
}

export default function PersonalInformation({
  profile,
  editing,
  onEditingChange,
  variant = "standard",
}: PersonalInformationProps) {
  const router = useRouter();

  const initial = useMemo(
    (): ProfileFormState => ({
      name: profile.name,
      email: profile.email,
      phone: profile.phone || "",
      location: profile.location || "",
      bio: profile.bio || "",
    }),
    [profile],
  );

  const [form, setForm] = useState<ProfileFormState>(initial);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>("");

  const [lastEditing, setLastEditing] = useState(editing);
  if (editing !== lastEditing) {
    setLastEditing(editing);
    setForm(initial);
    setError("");
  }

  function handleSave() {
    setError("");
    if (!form.name.trim() || !form.email.trim()) {
      setError("Full name and email address are required.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateProfileAction({
          name: form.name,
          email: form.email,
          phone: form.phone || "",
          location: form.location || null,
          bio: form.bio || null,
        });

        if (result.success) {
          onEditingChange(false);
          router.refresh();
        } else if (result.error) {
          setError(result.error.message);
        }
      } catch (err) {
        setError((err as Error)?.message || "Failed to update profile");
      }
    });
  }

  const joinDateValue = new Date(profile.dateOfRecruitment);
  const joinDate = Number.isNaN(joinDateValue.getTime())
    ? "Not specified"
    : formatSaudiMonthYear(joinDateValue);
  const isDirty =
    form.name !== initial.name ||
    form.email !== initial.email ||
    form.phone !== initial.phone ||
    form.location !== initial.location ||
    form.bio !== initial.bio;

  if (variant === "manager") {
    return (
      <section
        aria-label="Personal information"
        className={cn(
          `${profileCardClass} profile-reveal overflow-hidden p-0`,
          editing && "profile-edit-active",
        )}
        style={{ "--profile-delay": "150ms" } as CSSProperties}
      >
        <header className="border-gp-border-subtle flex flex-wrap items-start justify-between gap-3 border-b px-5 py-5">
          <div className="flex items-start gap-3">
            <span className="profile-section-icon bg-gp-gold-50 text-gp-gold-700 ring-gp-gold-300 flex size-10 shrink-0 items-center justify-center rounded-[12px] ring-1 ring-inset">
              <UserRound className="size-5" aria-hidden="true" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-gp-navy-900 text-lg font-semibold">
                  Personal Information
                </h2>
                {editing && (
                  <span className="profile-edit-badge bg-gp-gold-50 text-gp-gold-700 ring-gp-gold-300 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset">
                    Unsaved changes
                  </span>
                )}
              </div>
              <p className="text-gp-text-muted mt-1 text-sm leading-5 font-medium">
                Identity, contact and professional details.
              </p>
            </div>
          </div>

          {editing && (
            <Button
              type="button"
              onClick={handleSave}
              disabled={isPending || !isDirty}
              className="bg-gp-gold-500 shadow-gp-gold-action hover:bg-gp-gold-600 h-10 cursor-pointer gap-2 rounded-[10px] px-4 text-sm font-semibold text-white transition-all duration-[170ms] hover:-translate-y-px active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Saving
                </>
              ) : (
                <>
                  <Save className="size-4" aria-hidden="true" />
                  Save Changes
                </>
              )}
            </Button>
          )}
        </header>

        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="border-gp-danger-border bg-gp-danger-soft text-gp-danger mx-5 mt-5 rounded-[12px] border px-4 py-3 text-sm font-semibold"
          >
            {error}
          </div>
        )}

        {editing ? (
          <div className="space-y-5 p-5">
            <div>
              <p className="text-gp-text-muted text-xs font-semibold tracking-[0.05em] uppercase">
                Basic Information
              </p>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="text-gp-navy-900 text-sm font-semibold">
                  Full Name
                  <Input
                    className={managerInputClass}
                    value={form.name}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, name: e.target.value }))
                    }
                    placeholder="Enter full name"
                    disabled={isPending}
                    aria-invalid={!form.name.trim()}
                  />
                </label>
                <label className="text-gp-navy-900 text-sm font-semibold">
                  Email Address
                  <Input
                    type="email"
                    className={managerInputClass}
                    value={form.email}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, email: e.target.value }))
                    }
                    placeholder="name@company.com"
                    disabled={isPending}
                    aria-invalid={!form.email.trim()}
                  />
                </label>
              </div>
            </div>

            <div>
              <p className="text-gp-text-muted text-xs font-semibold tracking-[0.05em] uppercase">
                Contact Details
              </p>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="text-gp-navy-900 text-sm font-semibold">
                  Phone Number
                  <Input
                    className={managerInputClass}
                    value={form.phone}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, phone: e.target.value }))
                    }
                    placeholder="+966 50 000 0000"
                    disabled={isPending}
                  />
                </label>
                <label className="text-gp-navy-900 text-sm font-semibold">
                  Location
                  <Input
                    className={managerInputClass}
                    value={form.location}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, location: e.target.value }))
                    }
                    placeholder="City, Country"
                    disabled={isPending}
                  />
                </label>
              </div>
            </div>

            <div>
              <p className="text-gp-text-muted text-xs font-semibold tracking-[0.05em] uppercase">
                Professional Information
              </p>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="border-gp-border-subtle bg-gp-surface-subtle rounded-[12px] border px-3 py-3">
                  <p className="text-gp-text-muted text-xs font-semibold">
                    Position
                  </p>
                  <p className="text-gp-navy-900 mt-1 text-sm font-semibold capitalize">
                    {formatRole(profile.role)}
                  </p>
                </div>
                <div className="border-gp-border-subtle bg-gp-surface-subtle rounded-[12px] border px-3 py-3">
                  <p className="text-gp-text-muted text-xs font-semibold">
                    Department
                  </p>
                  <p className="text-gp-navy-900 mt-1 text-sm font-semibold">
                    {profile.department?.trim() || (
                      <MutedValue>Not assigned</MutedValue>
                    )}
                  </p>
                </div>
                <label className="text-gp-navy-900 text-sm font-semibold sm:col-span-2">
                  Bio
                  <Textarea
                    className={`${managerInputClass} min-h-24 pt-2`}
                    value={form.bio}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, bio: e.target.value }))
                    }
                    placeholder="Write a short bio..."
                    disabled={isPending}
                  />
                </label>
              </div>
            </div>
          </div>
        ) : (
          <div className="manager-profile-info-grid grid grid-cols-1 sm:grid-cols-2">
            <ManagerInfoCell
              label="Email"
              icon={Mail}
              accent="navy"
              href={`mailto:${profile.email}`}
              value={profile.email}
            />
            <ManagerInfoCell
              label="Phone"
              icon={Phone}
              accent={profile.phone?.trim() ? "navy" : "slate"}
              href={
                profile.phone?.trim()
                  ? `tel:${profile.phone.trim()}`
                  : undefined
              }
              value={
                profile.phone?.trim() ? (
                  profile.phone.trim()
                ) : (
                  <MutedValue>Not specified</MutedValue>
                )
              }
            />
            <ManagerInfoCell
              label="Department"
              icon={Building2}
              accent="navy"
              value={
                profile.department?.trim() ? (
                  profile.department.trim()
                ) : (
                  <MutedValue>Not assigned</MutedValue>
                )
              }
            />
            <ManagerInfoCell
              label="Location"
              icon={MapPin}
              accent="navy"
              value={
                profile.location?.trim() ? (
                  profile.location.trim()
                ) : (
                  <MutedValue>Not specified</MutedValue>
                )
              }
            />
            <ManagerInfoCell
              label="Position"
              icon={BriefcaseBusiness}
              accent="navy"
              value={
                <span className="capitalize">{formatRole(profile.role)}</span>
              }
            />
            <ManagerInfoCell
              label="Join Date"
              icon={CalendarCheck2}
              accent="navy"
              value={joinDate}
            />
            {profile.educationBackground?.trim() && (
              <ManagerInfoCell
                label="Education"
                icon={GraduationCap}
                accent="navy"
                value={profile.educationBackground.trim()}
              />
            )}
            {profile.bio?.trim() && (
              <ManagerInfoCell
                label="Bio"
                icon={AlignLeft}
                accent="navy"
                span
                value={
                  <span className="font-medium whitespace-pre-line">
                    {profile.bio.trim()}
                  </span>
                }
              />
            )}
          </div>
        )}
      </section>
    );
  }

  return (
    <section
      aria-label="Personal information"
      className={cn(
        `${profileCardClass} profile-reveal p-5`,
        editing && "profile-edit-active",
      )}
      style={{ "--profile-delay": "120ms" } as CSSProperties}
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="profile-section-icon bg-gold-50 text-gold-600 ring-gold-300/50 flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset">
            <UserRound className="size-5" aria-hidden />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-[#182033]">
                Personal Information
              </h3>
              {editing && (
                <span className="profile-edit-badge bg-gold-50 text-gold-700 ring-gold-300/50 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset">
                  Editing
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-[#667085]">
              {editing
                ? "Update the fields below and save your changes."
                : "Identity, contact and professional details."}
            </p>
          </div>
        </div>

        {editing && (
          <Button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="h-9 cursor-pointer gap-2 rounded-lg bg-[#C9A44C] px-4 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-px hover:bg-[#A67C1F] hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Saving
              </>
            ) : (
              <>
                <Save className="size-4" aria-hidden />
                Save Changes
              </>
            )}
          </Button>
        )}
      </header>

      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="text-dashboard-red mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm"
        >
          {error}
        </div>
      )}

      {editing ? (
        <div className="mt-5 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
          <InfoField
            label="Full Name"
            icon={UserRound}
            accent="navy"
            delay={40}
            span
          >
            <Input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              placeholder="Enter full name"
              disabled={isPending}
            />
          </InfoField>

          <InfoField label="Email Address" icon={Mail} accent="navy" delay={80}>
            <Input
              type="email"
              className={inputClass}
              value={form.email}
              onChange={(e) =>
                setForm((s) => ({ ...s, email: e.target.value }))
              }
              placeholder="name@company.com"
              disabled={isPending}
            />
          </InfoField>

          <InfoField
            label="Phone Number"
            icon={Phone}
            accent="navy"
            delay={120}
          >
            <Input
              className={inputClass}
              value={form.phone}
              onChange={(e) =>
                setForm((s) => ({ ...s, phone: e.target.value }))
              }
              placeholder="+966 50 000 0000"
              disabled={isPending}
            />
          </InfoField>

          <InfoField label="Location" icon={MapPin} accent="navy" delay={160}>
            <Input
              className={inputClass}
              value={form.location}
              onChange={(e) =>
                setForm((s) => ({ ...s, location: e.target.value }))
              }
              placeholder="City, Country"
              disabled={isPending}
            />
          </InfoField>

          <InfoField
            label="Bio"
            icon={AlignLeft}
            accent="navy"
            delay={200}
            span
          >
            <Textarea
              className={`${inputClass} min-h-20`}
              value={form.bio}
              onChange={(e) => setForm((s) => ({ ...s, bio: e.target.value }))}
              placeholder="Write a short bio..."
              disabled={isPending}
            />
          </InfoField>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <InfoField label="Email" icon={Mail} accent="navy" delay={40}>
            {profile.email}
          </InfoField>

          <InfoField label="Phone" icon={Phone} accent="navy" delay={80}>
            {profile.phone?.trim() ? (
              profile.phone
            ) : (
              <MutedValue>Not specified</MutedValue>
            )}
          </InfoField>

          <InfoField
            label="Department"
            icon={Building2}
            accent="navy"
            delay={120}
          >
            {profile.department?.trim() ? (
              profile.department
            ) : (
              <MutedValue>Not assigned</MutedValue>
            )}
          </InfoField>

          <InfoField label="Location" icon={MapPin} accent="navy" delay={160}>
            {profile.location?.trim() ? (
              profile.location
            ) : (
              <MutedValue>Not specified</MutedValue>
            )}
          </InfoField>

          <InfoField
            label="Position"
            icon={BriefcaseBusiness}
            accent="navy"
            delay={200}
          >
            <span className="capitalize">{formatRole(profile.role)}</span>
          </InfoField>

          <InfoField
            label="Join Date"
            icon={CalendarCheck2}
            accent="navy"
            delay={240}
          >
            {joinDate}
          </InfoField>

          {profile.educationBackground?.trim() && (
            <InfoField
              label="Education"
              icon={GraduationCap}
              accent="navy"
              delay={280}
            >
              {profile.educationBackground}
            </InfoField>
          )}

          {profile.bio?.trim() && (
            <InfoField
              label="Bio"
              icon={AlignLeft}
              accent="navy"
              delay={320}
              span
            >
              <span className="font-normal whitespace-pre-line">
                {profile.bio}
              </span>
            </InfoField>
          )}
        </div>
      )}
    </section>
  );
}
