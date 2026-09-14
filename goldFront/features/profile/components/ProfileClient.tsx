"use client";

import { useState } from "react";
import { UserProfile } from "../lib/types";
import ProfileSummary from "./ProfileSummary";
import PersonalInformation from "./PersonalInformation";
import AccountDetails from "./AccountDetails";
import ProfileCompletion from "./ProfileCompletion";
import QuickActions from "./QuickActions";
import ProfileHero from "./ProfileHero";

type ProfileClientProps = {
  profile: UserProfile;
  variant?: "standard" | "manager";
};

export default function ProfileClient({
  profile,
  variant = "standard",
}: ProfileClientProps) {
  const [editing, setEditing] = useState(false);

  if (variant === "manager") {
    return (
      <div className="manager-profile-page profile-page-shell mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-5">
        <ProfileHero
          profile={profile}
          editing={editing}
          onEditingChange={setEditing}
          variant="manager"
        />

        <ProfileSummary profile={profile} variant="manager" />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,72fr)_minmax(300px,28fr)]">
          <div className="flex min-w-0 flex-col gap-5">
            <PersonalInformation
              profile={profile}
              editing={editing}
              onEditingChange={setEditing}
              variant="manager"
            />
            <AccountDetails profile={profile} variant="manager" />
          </div>

          <aside className="flex min-w-0 flex-col gap-5 xl:sticky xl:top-[104px] xl:self-start">
            <QuickActions
              profile={profile}
              editing={editing}
              onEdit={setEditing}
              variant="manager"
            />
            <ProfileCompletion profile={profile} variant="manager" />
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page-shell mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-5">
      <ProfileHero
        profile={profile}
        editing={editing}
        onEditingChange={setEditing}
      />

      <ProfileSummary profile={profile} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.44fr)]">
        <PersonalInformation
          profile={profile}
          editing={editing}
          onEditingChange={setEditing}
        />
        <QuickActions profile={profile} editing={editing} onEdit={setEditing} />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.44fr)]">
        <AccountDetails profile={profile} />
        <ProfileCompletion profile={profile} />
      </div>
    </div>
  );
}
