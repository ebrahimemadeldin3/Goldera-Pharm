"use client";

import { FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TEMPLATES } from "../lib/constants";

export default function QuickTemplates({
  onSelect,
}: {
  onSelect?: (id: string) => void;
}) {
  return (
    <Card className="border-secondary-light max-w-[345px] gap-4 rounded-xl border bg-white shadow-none">
      <CardHeader>
        <CardTitle className="text-system-primary text-xl/6 font-semibold">
          Quick Templates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {TEMPLATES.map((t) => {
          return (
            <Button
              key={t.id}
              type="button"
              variant="ghost"
              onClick={() => onSelect?.(t.id)}
              className={`border-secondary-light h-11 w-full cursor-pointer justify-start gap-3 rounded-md border bg-white text-sm/5 font-medium text-black shadow-none`}
            >
              <FileText className="text-system-primary h-4 w-4" />
              {t.label}
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
