"use client";

import { useEffect, useState } from "react";
import UnsupportedScreen from "./UnsupportedScreen";

export default function ScreenGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      const isDesktop = width >= 1024;
      const isLandscapeTablet = width >= 768 && width > height;

      setAllowed(isDesktop || isLandscapeTablet);
    };

    check();
    window.addEventListener("resize", check);

    return () => window.removeEventListener("resize", check);
  }, []);

  if (allowed === null) return null; // avoid hydration mismatch

  if (!allowed) return <UnsupportedScreen />;

  return <>{children}</>;
}
