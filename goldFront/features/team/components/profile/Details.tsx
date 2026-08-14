"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { SafeCldImage } from "@/components/ui/safe-cld-image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  TrendingUp,
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import { format } from "date-fns";
import { User, RegionData } from "@/features/team/lib/types";
import { Region } from "@/lib/types/regions";
import { useMemo } from "react";

type DetailsProps = {
  data: User;
  isEditMode?: boolean;
  editedData?: {
    name: string;
    phone: string;
    region: RegionData;
    isActive: boolean;
  };
  regions?: Region[];
  onFieldChange?: <
    K extends keyof {
      name: string;
      phone: string;
      region: RegionData;
      isActive: boolean;
    },
  >(
    field: K,
    value: K extends "isActive"
      ? boolean
      : K extends "region"
        ? RegionData
        : string,
  ) => void;
};

export default function Details({
  data,
  isEditMode = false,
  editedData,
  regions = [],
  onFieldChange,
}: DetailsProps) {
  const isSupervisor = data.role === "SUPERVISOR";
  const displayData = isEditMode && editedData ? editedData : data;
  const isActive = displayData.isActive;

  const joinedDateFormatted = data.joinedDate
    ? `Joined ${format(new Date(data.joinedDate), "MMMM dd, yyyy")}`
    : "N/A";

  // Get subregions for selected region
  const subRegions = useMemo(() => {
    if (!editedData?.region?.id) return [];
    const selectedRegion = regions.find((r) => r.id === editedData.region.id);
    return selectedRegion?.subRegions || [];
  }, [editedData, regions]);

  return (
    <section className="flex w-full flex-col gap-6">
      <Card className="border-secondary-light w-full rounded-[14px] border-[0.8px] bg-white px-6 py-6 shadow-none">
        <CardContent className="flex flex-col gap-4">
          <div className="flex w-full flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-4">
              {data.avatar ? (
                <SafeCldImage
                  src={data.avatar}
                  alt={displayData.name}
                  width={96}
                  height={96}
                  className="size-24 rounded-full object-cover"
                />
              ) : (
                <div
                  className={`flex size-24 items-center justify-center rounded-full text-[32px] font-normal text-white ${
                    isSupervisor ? "gradient-blue" : "gradient-green"
                  }`}
                  aria-hidden
                >
                  {getInitials(displayData.name)}
                </div>
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  {isEditMode ? (
                    <Input
                      value={displayData.name || ""}
                      onChange={(e) => onFieldChange?.("name", e.target.value)}
                      className="input h-8 w-full text-[16px] font-normal sm:w-64"
                      placeholder="Name"
                    />
                  ) : (
                    <h3 className="text-[16px] font-normal text-black">
                      {displayData.name}
                    </h3>
                  )}
                  <span
                    className={`rounded-full bg-linear-to-b px-2 py-0.5 text-xs font-medium text-white ${
                      isSupervisor ? "gradient-blue" : "gradient-green"
                    }`}
                  >
                    {data.role === "MEDICAL_REP"
                      ? "Medical Rep"
                      : data.role === "SUPERVISOR"
                        ? "Supervisor"
                        : data.role}
                  </span>
                  {isEditMode ? (
                    <div className="flex items-center gap-2 rounded-full border bg-white px-2 py-0.5">
                      <Switch
                        checked={isActive}
                        onCheckedChange={(checked) =>
                          onFieldChange?.("isActive", checked)
                        }
                        className="scale-75"
                      />
                      <span
                        className={`text-xs font-medium ${
                          isActive
                            ? "text-dashboard-green"
                            : "text-dashboard-red"
                        }`}
                      >
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  ) : (
                    <span
                      className={`rounded-full border bg-white px-2 py-0.5 text-xs font-medium ${
                        isActive
                          ? "border-dashboard-green text-dashboard-green"
                          : "border-gold-stroke text-dashboard-red"
                      }`}
                    >
                      {isActive ? "Active" : "Inactive"}
                    </span>
                  )}
                </div>
                <div className="text-secondary-dark grid grid-cols-1 gap-4 text-[16px] md:grid-cols-2">
                  <div className="text-secondary-dark flex items-center gap-2">
                    <MapPin size={16} />
                    {isEditMode ? (
                      <div className="flex flex-1 gap-2">
                        <Select
                          value={editedData?.region?.id || ""}
                          onValueChange={(regionId) => {
                            const selectedRegion = regions.find(
                              (r) => r.id === regionId,
                            );
                            if (selectedRegion) {
                              // Update region object with selected region and reset subregion
                              onFieldChange?.("region", {
                                name: selectedRegion.name,
                                id: selectedRegion.id,
                                subRegion: {
                                  name: "",
                                  id: "",
                                },
                              });
                            }
                          }}
                        >
                          <SelectTrigger className="h-7 flex-1 text-[14px]">
                            <SelectValue placeholder="Select region" />
                          </SelectTrigger>
                          <SelectContent>
                            {regions.map((region) => (
                              <SelectItem key={region.id} value={region.id}>
                                {region.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={editedData?.region?.subRegion?.id || ""}
                          onValueChange={(subRegionId) => {
                            const selectedSubRegion = subRegions.find(
                              (sr) => sr.id === subRegionId,
                            );
                            if (selectedSubRegion && editedData?.region) {
                              // Update region object with selected subregion
                              onFieldChange?.("region", {
                                ...editedData.region,
                                subRegion: {
                                  name: selectedSubRegion.name,
                                  id: selectedSubRegion.id,
                                },
                              });
                            }
                          }}
                          disabled={
                            !editedData?.region?.id || subRegions.length === 0
                          }
                        >
                          <SelectTrigger className="h-7 flex-1 text-[14px]">
                            <SelectValue placeholder="Select sub-region" />
                          </SelectTrigger>
                          <SelectContent>
                            {subRegions.map((subRegion) => (
                              <SelectItem
                                key={subRegion.id}
                                value={subRegion.id}
                              >
                                {subRegion.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <span>
                        {displayData.region?.name} -{" "}
                        {displayData.region?.subRegion?.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={16} />
                    <span>{data.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} />
                    {isEditMode ? (
                      <Input
                        value={displayData.phone || ""}
                        onChange={(e) =>
                          onFieldChange?.("phone", e.target.value)
                        }
                        className="input h-7 flex-1 text-[14px]"
                        placeholder="Phone"
                      />
                    ) : (
                      <span>{displayData.phone}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon size={16} />
                    <span>{joinedDateFormatted}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="grid w-full max-w-[1083px] grid-cols-1 justify-between gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-secondary-light flex flex-1 items-center justify-center rounded-[14px] border-[0.8px] bg-white text-center shadow-none">
          <CardContent className="flex flex-col gap-1">
            <p className="text-secondary-dark text-[16px] font-normal">
              Total Sales
            </p>
            <div className="text-lg font-medium text-black">
              {data.totalSales || "N/A"}
            </div>
            <div className="text-dashboard-green flex items-center justify-center gap-1 text-[14px]">
              <TrendingUp size={12} />
              <span>+12%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-secondary-light flex flex-1 items-center justify-center rounded-[14px] border-[0.8px] bg-white text-center shadow-none">
          <CardContent className="flex flex-col gap-1">
            <p className="text-secondary-dark text-[16px] font-normal">
              Target Achievement
            </p>
            <div className="text-lg font-medium text-black">
              {data.targetPercentage || 0}%
            </div>
            <div className="">
              <Progress
                value={data.targetPercentage || 0}
                className="bg-secondary-light *:bg-dashboard-blue h-2 rounded-full"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-secondary-light flex flex-1 items-center justify-center rounded-[14px] border-[0.8px] bg-white text-center shadow-none">
          <CardContent className="flex flex-col gap-1">
            <p className="text-secondary-dark text-[16px] font-normal">
              No. of visits
            </p>
            <div className="text-lg font-medium text-black">
              {data.monthlyVisits || 0} Visit/Month
            </div>
          </CardContent>
        </Card>

        <Card className="border-secondary-light flex flex-1 items-center justify-center rounded-[14px] border-[0.8px] bg-white text-center shadow-none">
          <CardContent className="flex flex-col gap-1">
            <p className="text-secondary-dark text-[16px] font-normal">
              Years of Service
            </p>
            <div className="text-lg font-medium text-black">
              {data.yearsOfService || 0}
            </div>
            <div className="text-secondary-dark text-xs">Years</div>
          </CardContent>
        </Card>
      </section>
    </section>
  );
}
