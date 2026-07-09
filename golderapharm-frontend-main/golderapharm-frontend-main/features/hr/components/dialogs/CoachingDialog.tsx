"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Coaching = {
  id?: string;
  [key: string]: unknown;
};

type CoachingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coachings: Coaching[];
  repCoachings: Coaching[];
  userName: string;
};

export function CoachingDialog({
  open,
  onOpenChange,
  coachings,
  repCoachings,
  userName,
}: CoachingDialogProps) {
  const allCoachingSessions = [...coachings, ...repCoachings];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Coaching Sessions - {userName}</DialogTitle>
          <DialogDescription>
            Total sessions: {allCoachingSessions.length} (Given:{" "}
            {coachings.length}, Received: {repCoachings.length})
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          {allCoachingSessions.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-500">
              No coaching sessions found
            </div>
          ) : (
            <>
              {coachings.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-black">
                    Coaching Given ({coachings.length})
                  </h3>
                  <div className="space-y-3">
                    {coachings.map((coaching, idx) => (
                      <div
                        key={coaching.id || idx}
                        className="rounded-lg border border-green-200 bg-green-50 p-4"
                      >
                        <pre className="text-xs text-slate-600">
                          {JSON.stringify(coaching, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {repCoachings.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-black">
                    Coaching Received ({repCoachings.length})
                  </h3>
                  <div className="space-y-3">
                    {repCoachings.map((coaching, idx) => (
                      <div
                        key={coaching.id || idx}
                        className="rounded-lg border border-blue-200 bg-blue-50 p-4"
                      >
                        <pre className="text-xs text-slate-600">
                          {JSON.stringify(coaching, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
