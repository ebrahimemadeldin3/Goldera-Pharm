"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormDrawer } from "@/components/shared/FormDrawer";
import {
  CalendarIcon,
  Clock3,
  History,
  Loader2,
  Star,
  UserCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatDateOnly, formatSaudiDateDisplay } from "@/lib/utils";
import {
  HOURS,
  VISIT_DURATION_OPTIONS,
} from "@/features/visits/lib/constants";
import {
  createHistoricalVisitAction,
  getAvailableManagersAction,
} from "@/features/visits/api";
import type { DoctorApiResponse } from "@/features/doctors/lib/types/api";

const SAUDI_TIME_ZONE = "Asia/Riyadh";

interface HistoricalVisitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctors: DoctorApiResponse[];
}

function getCurrentSaudiDateAndTime(): { dateKey: string; time: string } {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SAUDI_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const map: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") map[part.type] = part.value;
  }
  const hour = map.hour === "24" ? "00" : map.hour;
  return {
    dateKey: `${map.year}-${map.month}-${map.day}`,
    time: `${hour}:${map.minute}`,
  };
}

export default function HistoricalVisitDialog({
  open,
  onOpenChange,
  doctors,
}: HistoricalVisitDialogProps) {
  const router = useRouter();
  const [doctorId, setDoctorId] = useState("");
  const [visitDate, setVisitDate] = useState<Date | undefined>(() => new Date());
  const [time, setTime] = useState("09:00");
  const [duration, setDuration] = useState("30 min");
  const [companionType, setCompanionType] = useState<"SINGLE" | "WITH_MANAGER">(
    "SINGLE",
  );
  const [accompanyingManagerId, setAccompanyingManagerId] = useState("");
  const [managers, setManagers] = useState<
    Array<{ id: string; name: string; role: string }>
  >([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [rating, setRating] = useState(5);
  const [visitPurpose, setVisitPurpose] = useState("");
  const [discussedTopicsText, setDiscussedTopicsText] = useState("");
  const [doctorFeedback, setDoctorFeedback] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    getAvailableManagersAction().then((res) => {
      if (mounted && res.success && res.data) {
        setManagers(res.data);
      }
      if (mounted) setLoadingManagers(false);
    });
    return () => {
      mounted = false;
    };
  }, [open]);

  const activeDoctors = useMemo(
    () => doctors.filter((d) => d.isActive !== false),
    [doctors],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMessage(null);

    if (!doctorId) {
      setErrorMessage("Please select a doctor.");
      return;
    }
    if (!visitDate) {
      setErrorMessage("Please select the visit date.");
      return;
    }
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
      setErrorMessage("Visit time must be between 00:00 and 23:59.");
      return;
    }

    const currentSaudi = getCurrentSaudiDateAndTime();
    const selectedDateKey = formatDateOnly(visitDate);
    if (
      selectedDateKey > currentSaudi.dateKey ||
      (selectedDateKey === currentSaudi.dateKey && time > currentSaudi.time)
    ) {
      setErrorMessage(
        "Historical visits cannot be recorded for a future date or time.",
      );
      return;
    }

    if (companionType === "WITH_MANAGER" && !accompanyingManagerId) {
      setErrorMessage("Please select the accompanying Manager for a Joint Visit.");
      return;
    }

    if (!visitPurpose.trim()) {
      setErrorMessage("Visit purpose is required.");
      return;
    }

    const discussedTopics = discussedTopicsText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (discussedTopics.length === 0) {
      setErrorMessage("Enter at least one discussed topic (comma-separated).");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createHistoricalVisitAction({
        doctorId,
        date: visitDate,
        time,
        duration,
        companionType,
        accompanyingManagerId:
          companionType === "WITH_MANAGER" ? accompanyingManagerId : undefined,
        rating,
        visitPurpose: visitPurpose.trim(),
        discussedTopics,
        doctorFeedback: doctorFeedback.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (!result.success) {
        const msg =
          result.error?.message || "Failed to record historical visit.";
        setErrorMessage(msg);
        toast.error(msg);
        return;
      }

      toast.success("Historical visit recorded successfully.");
      onOpenChange(false);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentSaudiDateKey = getCurrentSaudiDateAndTime().dateKey;

  return (
    <FormDrawer
      open={open}
      onOpenChange={(nextOpen: boolean) => {
        if (!isSubmitting) onOpenChange(nextOpen);
      }}
      title="Add Visit"
      description="Record a visit that has already taken place."
      closeLabel="Close Add Visit dialog"
    >
      <form onSubmit={handleSubmit} className="space-y-5 p-4 sm:p-6">
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-900">
          <History className="mt-0.5 size-4 shrink-0 text-emerald-700" />
          <div>
            <p className="font-semibold">
              Record a visit that has already taken place.
            </p>
            <p className="mt-0.5 text-emerald-800/80">
              This saves the completed visit and its report directly to your
              history without scheduling a future reminder.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700"
          >
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="hist-doctor">Doctor *</Label>
            <Select value={doctorId} onValueChange={setDoctorId}>
              <SelectTrigger id="hist-doctor" className="w-full">
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {activeDoctors.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id}>
                    {doc.nameEN || doc.nameAR}
                    {doc.accountName ? ` — ${doc.accountName}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Visit Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 size-4 text-slate-400" />
                  {visitDate ? formatSaudiDateDisplay(visitDate) : "Pick date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={visitDate}
                  onSelect={setVisitDate}
                  disabled={(day) => formatDateOnly(day) > currentSaudiDateKey}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="hist-time">Visit Time *</Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger id="hist-time" className="w-full">
                <Clock3 className="mr-2 size-4 text-slate-400" />
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {HOURS.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="hist-duration">Duration (15-min increments) *</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger id="hist-duration" className="w-full">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {VISIT_DURATION_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="hist-companion">Visit Type *</Label>
            <Select
              value={companionType}
              onValueChange={(val: "SINGLE" | "WITH_MANAGER") => {
                setCompanionType(val);
                if (val === "SINGLE") setAccompanyingManagerId("");
              }}
            >
              <SelectTrigger id="hist-companion" className="w-full">
                <UserCheck className="mr-2 size-4 text-slate-400" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SINGLE">Single Visit (Rep Alone)</SelectItem>
                <SelectItem value="WITH_MANAGER">
                  Joint Visit (With Manager)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {companionType === "WITH_MANAGER" && (
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="hist-manager">Accompanying Manager *</Label>
              <Select
                value={accompanyingManagerId}
                onValueChange={setAccompanyingManagerId}
                disabled={loadingManagers}
              >
                <SelectTrigger id="hist-manager" className="w-full">
                  <Users className="mr-2 size-4 text-slate-400" />
                  <SelectValue
                    placeholder={
                      loadingManagers ? "Loading managers..." : "Select manager"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {managers.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="hist-purpose">Visit Purpose *</Label>
            <Input
              id="hist-purpose"
              value={visitPurpose}
              onChange={(e) => setVisitPurpose(e.target.value)}
              placeholder="e.g. Product presentation & follow-up"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Visit Rating *</Label>
            <div className="flex h-10 items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={cn(
                    "rounded-md p-1.5 transition-colors",
                    star <= rating
                      ? "text-amber-500"
                      : "text-slate-300 hover:text-slate-400",
                  )}
                  aria-label={`Rate ${star} out of 5`}
                >
                  <Star
                    className="size-5"
                    fill={star <= rating ? "currentColor" : "none"}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-semibold text-slate-600">
                {rating}/5
              </span>
            </div>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="hist-topics">
              Discussed Topics (comma-separated) *
            </Label>
            <Input
              id="hist-topics"
              value={discussedTopicsText}
              onChange={(e) => setDiscussedTopicsText(e.target.value)}
              placeholder="e.g. Product efficacy, Dosing schedule, Samples"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="hist-feedback">Doctor Feedback (optional)</Label>
            <Textarea
              id="hist-feedback"
              rows={2}
              value={doctorFeedback}
              onChange={(e) => setDoctorFeedback(e.target.value)}
              placeholder="Key feedback from the doctor..."
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="hist-notes">Notes (optional)</Label>
            <Textarea
              id="hist-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional visit notes..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gp-rep-primary hover:bg-gp-rep-primary-hover text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving Visit...
              </>
            ) : (
              "Add Visit"
            )}
          </Button>
        </div>
      </form>
    </FormDrawer>
  );
}
