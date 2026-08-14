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

export default function PersonalInformation({
  profile,
  editing,
  onEditingChange,
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

  const joinDate = formatSaudiMonthYear(new Date(profile.dateOfRecruitment));

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
            accent="gold"
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

          <InfoField label="Email Address" icon={Mail} accent="blue" delay={80}>
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
            accent="teal"
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

          <InfoField label="Location" icon={MapPin} accent="purple" delay={160}>
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
            accent="green"
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
          <InfoField label="Email" icon={Mail} accent="blue" delay={40}>
            {profile.email}
          </InfoField>

          <InfoField label="Phone" icon={Phone} accent="teal" delay={80}>
            {profile.phone?.trim() ? (
              profile.phone
            ) : (
              <MutedValue>Not specified</MutedValue>
            )}
          </InfoField>

          <InfoField
            label="Department"
            icon={Building2}
            accent="purple"
            delay={120}
          >
            {profile.department?.trim() ? (
              profile.department
            ) : (
              <MutedValue>Not assigned</MutedValue>
            )}
          </InfoField>

          <InfoField label="Location" icon={MapPin} accent="green" delay={160}>
            {profile.location?.trim() ? (
              profile.location
            ) : (
              <MutedValue>Not specified</MutedValue>
            )}
          </InfoField>

          <InfoField
            label="Position"
            icon={BriefcaseBusiness}
            accent="gold"
            delay={200}
          >
            <span className="capitalize">{formatRole(profile.role)}</span>
          </InfoField>

          <InfoField
            label="Join Date"
            icon={CalendarCheck2}
            accent="blue"
            delay={240}
          >
            {joinDate}
          </InfoField>

          {profile.educationBackground?.trim() && (
            <InfoField
              label="Education"
              icon={GraduationCap}
              accent="purple"
              delay={280}
            >
              {profile.educationBackground}
            </InfoField>
          )}

          {profile.bio?.trim() && (
            <InfoField
              label="Bio"
              icon={AlignLeft}
              accent="green"
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
