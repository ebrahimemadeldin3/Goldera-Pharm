"use client";

import { useState, type CSSProperties } from "react";
import { BadgeCheck, Camera, Pencil, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SafeCldImage } from "@/components/ui/safe-cld-image";
import { getInitials } from "@/lib/utils";
import { UserProfile } from "../lib/types";
import { formatRole, profileCardClass } from "../lib/utils";
import ProfileImageDialog from "./ProfileImageDialog";

type ProfileHeroProps = {
  profile: UserProfile;
  editing: boolean;
  onEditingChange: (editing: boolean) => void;
};

const AVATAR_SIZE = 128;

export default function ProfileHero({
  profile,
  editing,
  onEditingChange,
}: ProfileHeroProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const hasImage = Boolean(profile.profileImage?.url);

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
                <div className="gradient-gold flex size-full items-center justify-center text-white">
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
              className="profile-camera text-gold-600 ring-gold-300/60 hover:bg-gold-50 focus-visible:ring-gold-300 absolute right-1 bottom-1 flex size-9 cursor-pointer items-center justify-center rounded-full bg-white shadow-[0_8px_18px_rgba(24,32,51,0.14)] ring-1 transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <Camera className="size-4" aria-hidden />
            </button>
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
              <span className="bg-gold-50 text-gold-700 ring-gold-300/60 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset">
                <BadgeCheck className="size-3.5" aria-hidden />
                <span className="capitalize">{formatRole(profile.role)}</span>
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
                  profile.isActive
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    : "text-dashboard-red bg-red-50 ring-red-200"
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
                  className="hover:border-gold-300 hover:bg-gold-50 h-10 cursor-pointer gap-2 rounded-lg border-[#E5E8EF] bg-white px-4 text-sm font-semibold text-[#182033] shadow-sm transition-all hover:-translate-y-px active:translate-y-0"
                  onClick={() => onEditingChange(false)}
                >
                  <X className="size-4" aria-hidden />
                  Cancel
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => onEditingChange(true)}
                  className="h-10 cursor-pointer gap-2 rounded-lg bg-[#C9A44C] px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(166,124,31,0.18)] transition-all hover:-translate-y-px hover:bg-[#A67C1F] hover:shadow-[0_12px_24px_rgba(166,124,31,0.22)] active:translate-y-0"
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
