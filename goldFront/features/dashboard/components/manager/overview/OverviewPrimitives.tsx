import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CircleAlert,
  Inbox,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OverviewSection, SectionError } from "./types";
import styles from "./overview.module.css";

export function OverviewEmpty({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className={styles.empty}>
      <Inbox size={23} aria-hidden="true" />
      <p>{title}</p>
      {children && <span>{children}</span>}
    </div>
  );
}
export function OverviewProblem({
  title,
  message,
  diagnostic,
  retry,
  pending,
}: {
  title: string;
  message?: string;
  diagnostic?: SectionError;
  retry?: () => void;
  pending?: boolean;
}) {
  return (
    <div className={styles.problem} role="alert">
      <CircleAlert size={19} aria-hidden="true" />
      <div>
        <p>{title}</p>
        <span>
          {message ||
            diagnostic?.message ||
            "Use Refresh to try loading this data again."}
        </span>
        {diagnostic && (
          <details>
            <summary>Details for support</summary>
            <span>
              {diagnostic.source} · {diagnostic.code} · Reference{" "}
              {diagnostic.requestId.slice(0, 8)}
            </span>
          </details>
        )}
        {retry && (
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={retry}
            className="mt-3 rounded-[8px]"
          >
            <RefreshCw size={14} />
            {pending ? "Retrying…" : "Retry"}
          </Button>
        )}
      </div>
    </div>
  );
}
export function OverviewBoundary<T>({
  section,
  label,
  children,
}: {
  section: OverviewSection<T>;
  label: string;
  children: (data: T) => ReactNode;
}) {
  return section.status === "error" ? (
    <OverviewProblem
      title={`${label} unavailable`}
      diagnostic={section.error}
    />
  ) : (
    children(section.data)
  );
}
export function OverviewPanel({
  title,
  subtitle,
  href,
  children,
  className = "",
  action,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section className={`${styles.panel} ${className}`}>
      <header className={styles.panelHeading}>
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action ||
          (href && (
            <Link
              href={href}
              aria-label={`View all ${title.toLowerCase()}`}
              className={styles.textLink}
            >
              View all <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          ))}
      </header>
      {children}
    </section>
  );
}
export function OverviewKPI({
  title,
  value,
  helper,
  icon: Icon,
  href,
  error,
  scope,
}: {
  title: string;
  value: ReactNode;
  helper: string;
  icon: LucideIcon;
  href: string;
  error?: boolean;
  scope: string;
}) {
  return (
    <Link
      href={href}
      className={`${styles.kpi} ${error ? styles.kpiError : ""}`}
      aria-label={`${title}: ${error ? "data unavailable" : typeof value === "string" || typeof value === "number" ? value : "view details"}`}
    >
      <div className={styles.kpiTop}>
        <span className={styles.kpiIcon}>
          <Icon size={18} aria-hidden="true" />
        </span>
        <ArrowUpRight
          size={15}
          className={styles.kpiArrow}
          aria-hidden="true"
        />
      </div>
      <p className={styles.kpiLabel}>{title}</p>
      <div className={styles.kpiValue}>{error ? "—" : value}</div>
      <p className={styles.kpiHelper}>
        {error ? "Data unavailable · use Refresh" : helper}
      </p>
      <span className={styles.kpiScope}>{scope}</span>
    </Link>
  );
}
export function OverviewStatus({ status }: { status: string }) {
  const success = status === "COMPLETED" || status === "APPROVED";
  const danger = status === "CANCELLED" || status === "REJECTED";
  return (
    <span
      className={`${styles.status} ${success ? styles.statusSuccess : danger ? styles.statusDanger : styles.statusPending}`}
    >
      {status.replaceAll("_", " ").toLowerCase()}
    </span>
  );
}
export function OverviewSkeleton() {
  return (
    <div
      className={styles.overview}
      aria-label="Loading manager dashboard"
      aria-busy="true"
    >
      <div className={`${styles.skeleton} h-16 w-2/3`} />
      <div className={`${styles.skeleton} h-32 w-full`} />
      <div className={styles.kpis}>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className={`${styles.skeleton} h-44`} />
        ))}
      </div>
      <div className={styles.analytics}>
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className={`${styles.skeleton} h-80`} />
        ))}
      </div>
    </div>
  );
}
