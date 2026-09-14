"use client";

import { useState, type CSSProperties } from "react";
import {
  BadgeCheck,
  CalendarDays,
  Camera,
  Fingerprint,
  Mail,
  Pencil,
  ShieldCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SafeCldImage } from "@/components/ui/safe-cld-image";
import { cn, formatSaudiMonthYear, getInitials } from "@/lib/utils";
import { UserProfile } from "../lib/types";
import {
  formatRole,
  getDisplayEmployeeId,
  profileCardClass,
} from "../lib/utils";
import ProfileImageDialog from "./ProfileImageDialog";

type ProfileHeroProps = {
  profile: UserProfile;
  editing: boolean;
  onEditingChange: (editing: boolean) => void;
  variant?: "standard" | "manager";
};

const AVATAR_SIZE = 128;

export default function ProfileHero({
  profile,
  editing,
  onEditingChange,
  variant = "standard",
}: ProfileHeroProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const hasImage = Boolean(profile.profileImage?.url);
  const roleLabel = formatRole(profile.role);
  const employeeId = getDisplayEmployeeId(profile.id);
  const joinedLabel = (() => {
    const date = new Date(profile.dateOfRecruitment);
    return Number.isNaN(date.getTime())
      ? "Join date not set"
      : `Joined ${formatSaudiMonthYear(date)}`;
  })();

  if (variant === "manager") {
    return (
      <>
        <section
          aria-label="Profile overview"
          className={`${profileCardClass} manager-profile-hero profile-reveal overflow-hidden p-5 sm:p-6`}
          style={{ "--profile-delay": "0ms" } as CSSProperties}
        >
          <span className="manager-profile-hero-accent" aria-hidden="true" />
          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <div className="profile-avatar manager-profile-avatar group relative size-28 shrink-0 sm:size-[124px]">
                <div className="border-gp-gold-300 bg-gp-gold-50 size-full overflow-hidden rounded-full border shadow-[0_14px_30px_rgba(16,29,54,0.16)] ring-4 ring-white">
                  {hasImage ? (
                    <SafeCldImage
                      src={profile.profileImage!.public_id}
                      fallbackUrl={profile.profileImage!.url}
                      alt={profile.name}
                      width={AVATAR_SIZE}
                      height={AVATAR_SIZE}
                      className="size-full object-cover object-center"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-[linear-gradient(135deg,var(--gp-gold-500),var(--gp-gold-700))] text-white">
                      <span className="text-3xl font-semibold">
                        {getInitials(profile.name)}
                      </span>
                    </div>
                  )}
                </div>

                {profile.isActive && (
                  <span
                    className="manager-profile-online-indicator bg-gp-success absolute right-2 bottom-2 size-4 rounded-full border-2 border-white shadow-[0_4px_10px_rgba(22,133,87,0.26)]"
                    aria-label="Active account"
                  />
                )}

                <button
                  type="button"
                  onClick={() => setDialogOpen(true)}
                  aria-label="Change profile photo"
                  className="profile-camera manager-profile-camera focus-visible:ring-gp-navy-900/15 border-gp-border-control text-gp-navy-900 absolute right-0 bottom-0 flex size-9 cursor-pointer items-center justify-center rounded-full border bg-white shadow-[0_8px_18px_rgba(16,29,54,0.14)] transition-all duration-[190ms] ease-out focus-visible:ring-3 focus-visible:outline-none"
                >
                  <Camera className="size-4" aria-hidden="true" />
                </button>
              </div>

              <div className="min-w-0">
                <div className="manager-profile-hero-text">
                  <h1 className="text-gp-navy-900 text-[26px] leading-tight font-semibold sm:text-[31px] lg:text-[34px]">
                    {profile.name}
                  </h1>
                  <div className="text-gp-text-muted mt-2 flex flex-wrap justify-center gap-x-2 gap-y-1 text-sm font-medium sm:justify-start">
                    <span className="capitalize">{roleLabel}</span>
                    <span aria-hidden="true">/</span>
                    <span>
                      {profile.isActive ? "Active account" : "Inactive account"}
                    </span>
                  </div>
                  <div className="text-gp-text-muted mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-sm sm:justify-start">
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <Mail
                        className="text-gp-navy-900 size-3.5 shrink-0"
                        aria-hidden="true"
                      />
                      <span className="truncate">{profile.email}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays
                        className="text-gp-navy-900 size-3.5 shrink-0"
                        aria-hidden="true"
                      />
                      {joinedLabel}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <span className="manager-profile-badge bg-gp-gold-50 text-gp-gold-700 ring-gp-gold-300 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset">
                    <BadgeCheck className="size-3.5" aria-hidden="true" />
                    <span className="capitalize">{roleLabel}</span>
                  </span>
                  <span
                    className={cn(
                      "manager-profile-badge inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
                      profile.isActive
                        ? "bg-gp-success-soft text-gp-success ring-gp-success-border"
                        : "bg-gp-surface-control text-gp-text-muted ring-gp-border-control",
                    )}
                  >
                    <ShieldCheck className="size-3.5" aria-hidden="true" />
                    {profile.isActive ? "Active" : "Inactive"}
                  </span>
                  <span className="manager-profile-badge manager-profile-id-badge inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset">
                    <Fingerprint className="size-3.5" aria-hidden="true" />
                    ID {employeeId}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              {editing ? (
                <Button
                  type="button"
                  variant="outline"
                  className="focus-visible:ring-gp-gold-500/25 border-gp-border-control text-gp-navy-900 hover:border-gp-gold-300 hover:bg-gp-gold-50 h-10 cursor-pointer gap-2 rounded-[10px] bg-white px-4 text-sm font-semibold shadow-sm transition-all duration-[170ms] hover:-translate-y-px active:translate-y-0"
                  onClick={() => onEditingChange(false)}
                >
                  <X className="size-4" aria-hidden="true" />
                  Cancel
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => onEditingChange(true)}
                  className="manager-profile-edit-button focus-visible:ring-gp-gold-500/30 border-gp-navy-900 bg-gp-navy-900 hover:bg-gp-navy-900 h-10 cursor-pointer gap-2 rounded-[10px] border px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(16,29,54,0.18)] transition-all duration-[190ms] ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(16,29,54,0.24)] hover:brightness-110 focus-visible:ring-3 focus-visible:outline-none active:translate-y-0 active:shadow-[0_4px_10px_rgba(16,29,54,0.14)]"
                >
                  <Pencil
                    className="manager-profile-edit-icon text-gp-gold-500 size-4"
                    aria-hidden="true"
                  />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </section>

        <ProfileImageDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          hasImage={hasImage}
        />
      </>
    );
  }

  return (
    <>
      <section
        aria-label="Profile overview"
        className={`${profileCardClass} profile-hero-card profile-reveal p-6 sm:p-8`}
        style={{ "--profile-delay": "0ms" } as CSSProperties}
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="relative mx-auto size-28 shrink-0 sm:mx-0 sm:size-[116px]">
            <div className="bg-gold-50 size-full overflow-hidden rounded-full shadow-[0_10px_24px_rgba(24,32,51,0.12)] ring-4 ring-white">
              {hasImage ? (
                <SafeCldImage
                  src={profile.profileImage!.public_id}
                  fallbackUrl={profile.profileImage!.url}
                  alt={profile.name}
                  width={AVATAR_SIZE}
                  height={AVATAR_SIZE}
                  className="size-full object-cover object-center"
                />
              ) : (
                <div className="bg-[#168557] flex size-full items-center justify-center text-white">
                  <span className="text-3xl font-semibold">
                    {getInitials(profile.name)}
                  </span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              aria-label="Change profile photo"
              className={cn(
                "profile-camera absolute right-1 bottom-1 flex size-9 cursor-pointer items-center justify-center rounded-full bg-white shadow-[0_8px_18px_rgba(24,32,51,0.14)] ring-1 transition-colors duration-[190ms] ease-out focus-visible:ring-2 focus-visible:outline-none",
                profile.role === "MEDICAL_REP"
                  ? "text-[#168557] ring-[#CBEFDD] hover:bg-[#E9F8F1] focus-visible:ring-[#168557]"
                  : "text-gp-navy-900 ring-gp-border-control hover:bg-gp-surface-subtle focus-visible:ring-gp-navy-900/15",
              )}
            >
              <Camera className="size-4" aria-hidden />
            </button>
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
              <span className="bg-[#E9F8F1] text-[#168557] ring-[#CBEFDD] inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset">
                <BadgeCheck className="size-3.5" aria-hidden />
                <span className="capitalize">{formatRole(profile.role)}</span>
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
                  profile.isActive
                    ? "bg-gp-success-soft text-gp-success ring-gp-success-border"
                    : "bg-gp-surface-control text-gp-text-muted ring-gp-border-control"
                }`}
              >
                <ShieldCheck className="size-3.5" aria-hidden />
                {profile.isActive ? "Active account" : "Inactive account"}
              </span>
            </div>

            <h1 className="mt-4 text-[30px] leading-tight font-semibold text-[#182033] sm:text-[34px] md:truncate lg:text-[38px]">
              {profile.name}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#667085] sm:text-[15px]">
              Manage your identity and account information.
            </p>

            <div className="mt-5 flex justify-center sm:justify-start">
              {editing ? (
                <Button
                  type="button"
                  variant="outline"
                  className="hover:border-[#CBEFDD] hover:bg-[#E9F8F1] h-10 cursor-pointer gap-2 rounded-lg border-[#E5E8EF] bg-white px-4 text-sm font-semibold text-[#182033] shadow-sm transition-all hover:-translate-y-px active:translate-y-0"
                  onClick={() => onEditingChange(false)}
                >
                  <X className="size-4" aria-hidden />
                  Cancel
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => onEditingChange(true)}
                  className="h-10 cursor-pointer gap-2 rounded-lg bg-[#168557] px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(22,133,87,0.18)] transition-all hover:-translate-y-px hover:bg-[#107349] hover:shadow-[0_12px_24px_rgba(22,133,87,0.22)] active:translate-y-0"
                >
                  <Pencil className="size-4" aria-hidden />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <ProfileImageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        hasImage={hasImage}
      />
    </>
  );
}
