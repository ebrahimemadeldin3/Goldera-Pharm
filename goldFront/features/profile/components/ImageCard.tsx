"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapPin, Camera, Briefcase } from "lucide-react";
import { UserProfile } from "../lib/types";
import { getInitials } from "@/lib/utils";
import ProfileImageDialog from "./ProfileImageDialog";
import { SafeCldImage } from "@/components/ui/safe-cld-image";

export default function ImageCard({ profile }: { profile: UserProfile }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const initials = getInitials(profile.name);
  const department = profile.department || "Not assigned";
  const location = profile.location || "Not specified";
  const hasImage = !!profile.profileImage?.url;

  return (
    <>
      <Card className="border-secondary-light w-[345px] rounded-xl border bg-white shadow-none">
        <CardHeader className="m-0 flex flex-col items-center">
          <div className="relative">
            {hasImage ? (
              <div className="flex size-32 overflow-hidden rounded-full">
                <SafeCldImage
                  src={profile.profileImage!.public_id}
                  fallbackUrl={profile.profileImage!.url}
                  alt={profile.name}
                  width={140}
                  height={140}
                  className="object-cover object-center"
                />
              </div>
            ) : (
              <div className="bg-system-primary flex size-32 items-center justify-center rounded-full text-white">
                <span className="text-[32px]/[48px] font-normal text-white">
                  {initials}
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="gradient-blue absolute right-[0.5px] bottom-[0.5px] flex size-8 cursor-pointer items-center justify-center rounded-full text-white shadow"
              aria-label="Upload profile image"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 w-full text-center">
            <p className="text-2xl/9 font-semibold text-black">
              {profile.name}
            </p>
            <p className="text-secondary-dark mt-1 text-base/7 capitalize">
              {profile.role.toLowerCase().replace("_", " ")}
            </p>
          </div>
        </CardHeader>
        <Separator className="bg-secondary-light mx-auto max-w-[295px]" />
        <CardContent className="pt-0">
          <div className="space-y-3 text-sm/[21px] font-normal">
            <p className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span>{department}</span>
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </p>
          </div>
        </CardContent>
      </Card>
      <ProfileImageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        hasImage={hasImage}
      />
    </>
  );
}
