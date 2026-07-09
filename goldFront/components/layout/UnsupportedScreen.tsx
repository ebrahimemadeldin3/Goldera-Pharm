import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor } from "lucide-react";

export default function UnsupportedScreen() {
  return (
    <div className="flex h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mb-4 flex justify-center">
            <Monitor className="text-muted-foreground h-10 w-10" />
          </div>
          <CardTitle>Screen Not Supported</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-sm">
            This dashboard requires a minimum screen width of 1024px.
          </p>
          <p className="text-muted-foreground text-sm">
            Please resize your window or switch to a desktop device.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
