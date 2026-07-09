"use client";

import { useMemo, useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Pencil, Save, X } from "lucide-react";
import { UserProfile } from "../lib/types";
import { updateProfileAction } from "../api";
import { formatSaudiDateTimeDisplay, formatSaudiMonthYear } from "@/lib/utils";

type PersonalInformationProps = {
  profile: UserProfile;
};

type ProfileFormState = {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
};

export default function PersonalInformation({
  profile,
}: PersonalInformationProps) {
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

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProfileFormState>(initial);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>("");

  const inputBase =
    "bg-secondary-very-light border border-secondary-light py-1 px-3 text-black text-sm/[20px] font-normal shadow-none";

  const labelClass = "font-medium text-sm/[14px] text-black";
  const valueClass = "h-10 font-normal text-base/7 text-secondary-dark";

  function handleCancel() {
    setForm(initial);
    setError("");
    setEditing(false);
  }

  async function handleSave() {
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
          setEditing(false);
        } else if (result.error) {
          setError(result.error.message);
        }
      } catch (err) {
        setError((err as Error)?.message || "Failed to update profile");
      }
    });
  }

  // Format dates
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return formatSaudiMonthYear(new Date(dateString));
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-";
    return formatSaudiDateTimeDisplay(new Date(dateString));
  };

  const joinDate = formatDate(profile.dateOfRecruitment);
  const position = profile.role.toLowerCase().replace("_", " ");
  const department = profile.department || "Not assigned";

  return (
    <Card className="border-secondary-light h-fit w-[714px] gap-3 rounded-2xl border bg-white p-6 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between p-0">
        <CardTitle className="font-smeibold text-xl/[30px]">
          Personal Information
        </CardTitle>

        <div className="flex items-center gap-2">
          {editing && (
            <Button
              type="button"
              variant="outline"
              className="border-secondary-light cursor-pointer rounded-lg"
              onClick={handleCancel}
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          )}
          <Button
            type="button"
            onClick={() => (editing ? handleSave() : setEditing(true))}
            disabled={isPending}
            className={`bg-system-primary border-system-primary hover:text-system-primary cursor-pointer gap-2 rounded-lg border text-white hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 ${editing ? "border-black bg-black text-white hover:text-black" : ""} `}
          >
            {isPending ? (
              "Saving..."
            ) : editing ? (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4" />
                Edit Profile
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 pb-10">
        <div className="bg-secondary-light mb-4 h-px w-full" />

        {error && (
          <div className="text-dashboard-red mb-4 rounded-md bg-red-50 p-3 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-5 text-sm">
          {/* Full Name */}
          <div>
            <div className={labelClass}>Full Name</div>
            {editing ? (
              <Input
                className={`${inputBase} mt-1`}
                value={form.name ?? ""}
                onChange={(e) =>
                  setForm((s) => ({ ...s, name: e.target.value }))
                }
                placeholder="Enter full name"
                disabled={isPending}
              />
            ) : (
              <div className={`mt-1 ${valueClass}`}>{form.name}</div>
            )}
          </div>

          {/* Email */}
          <div>
            <div className={`flex items-center gap-2 ${labelClass}`}>
              <Mail className="h-4 w-4" />
              Email Address
            </div>
            {editing ? (
              <Input
                type="email"
                className={`${inputBase} mt-1`}
                value={form.email ?? ""}
                onChange={(e) =>
                  setForm((s) => ({ ...s, email: e.target.value }))
                }
                placeholder="name@company.com"
                disabled={isPending}
              />
            ) : (
              <div className={`mt-1 ${valueClass}`}>{form.email}</div>
            )}
          </div>

          {/* Phone */}
          <div>
            <div className={`flex items-center gap-2 ${labelClass}`}>
              <Phone className="h-4 w-4" />
              Phone Number
            </div>
            {editing ? (
              <Input
                className={`${inputBase} mt-1`}
                value={form.phone ?? ""}
                onChange={(e) =>
                  setForm((s) => ({ ...s, phone: e.target.value }))
                }
                placeholder="+966 50 000 0000"
                disabled={isPending}
              />
            ) : (
              <div className={`mt-1 ${valueClass}`}>{form.phone}</div>
            )}
          </div>

          {/* Position */}
          <div>
            <div className={labelClass}>Position</div>
            <div className={`mt-1 ${valueClass} capitalize`}>{position}</div>
          </div>

          {/* Join Date */}
          <div>
            <div className={labelClass}>Join Date</div>
            <div className={`mt-1 ${valueClass}`}>{joinDate}</div>
          </div>

          {/* Department */}
          <div>
            <div className={labelClass}>Department</div>
            <div className={`mt-1 ${valueClass}`}>{department}</div>
          </div>

          {/* Location */}
          <div>
            <div className={`flex items-center gap-2 ${labelClass}`}>
              <MapPin className="h-4 w-4" />
              Location
            </div>
            {editing ? (
              <Input
                className={`${inputBase} mt-1`}
                value={form.location ?? ""}
                onChange={(e) =>
                  setForm((s) => ({ ...s, location: e.target.value }))
                }
                placeholder="City, Country"
                disabled={isPending}
              />
            ) : (
              <div className={`mt-1 ${valueClass}`}>
                {form.location || "Not specified"}
              </div>
            )}
          </div>

          {/* Bio */}
          <div>
            <div className={labelClass}>Bio</div>
            {editing ? (
              <Textarea
                className={`${inputBase} mt-1 h-24`}
                value={form.bio ?? ""}
                onChange={(e) =>
                  setForm((s) => ({ ...s, bio: e.target.value }))
                }
                placeholder="Write a short bio..."
                disabled={isPending}
              />
            ) : (
              <p className={`mt-1 whitespace-pre-line ${valueClass}`}>
                {form.bio || "No bio added yet"}
              </p>
            )}
          </div>

          <div className="bg-secondary-light my-2 h-px w-full" />

          <div>
            <div className="mb-2 text-base/6 font-semibold text-black">
              Account Details
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className={labelClass}>Date of Birth</div>
                <div className={`mt-1 ${valueClass}`}>
                  {formatDate(profile.dateOfBirth)}
                </div>
              </div>

              <div>
                <div className={labelClass}>Account Status</div>
                <div className={`mt-1 ${valueClass}`}>
                  {profile.isActive ? "Active" : "Inactive"}
                </div>
              </div>

              <div>
                <div className={labelClass}>Iqama Number</div>
                <div className={`mt-1 ${valueClass}`}>
                  {profile.iqamaNumber?.trim() || "Not available"}
                </div>
              </div>

              <div>
                <div className={labelClass}>Passport Number</div>
                <div className={`mt-1 ${valueClass}`}>
                  {profile.passportNumber || "Not available"}
                </div>
              </div>

              <div>
                <div className={labelClass}>Last Login</div>
                <div className={`mt-1 ${valueClass}`}>
                  {formatDateTime(profile.lastLogin)}
                </div>
              </div>

              <div>
                <div className={labelClass}>Leave Days Total</div>
                <div className={`mt-1 ${valueClass}`}>
                  {profile.leaveDaysCountTotal}
                </div>
              </div>

              <div>
                <div className={labelClass}>Profile Created</div>
                <div className={`mt-1 ${valueClass}`}>
                  {formatDateTime(profile.createdAt)}
                </div>
              </div>

              <div>
                <div className={labelClass}>Last Updated</div>
                <div className={`mt-1 ${valueClass}`}>
                  {formatDateTime(profile.updatedAt)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
