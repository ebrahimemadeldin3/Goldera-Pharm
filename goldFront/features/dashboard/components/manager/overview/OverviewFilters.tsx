"use client";
import { useId, useState, type FormEvent } from "react";
import { CalendarDays, Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OverviewOptions, OverviewQuery } from "./types";
import {
  PERIOD_OPTIONS,
  periodDates,
  type OverviewPeriod,
  displayDay,
  defaultQuery,
} from "./format";
import styles from "./overview.module.css";

function OverviewFilterSelect({
  label,
  accessibleLabel = label,
  value,
  options,
  onValueChange,
}: {
  label: string;
  accessibleLabel?: string;
  value: string;
  options: { value: string; label: string }[];
  onValueChange: (value: string) => void;
}) {
  const id = useId();
  const selectedLabel = options.find((option) => option.value === value)?.label;
  return (
    <div className={styles.filterField}>
      <label htmlFor={id}>{label}</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          id={id}
          aria-label={accessibleLabel}
          title={selectedLabel}
          className={styles.filterSelectTrigger}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          className={styles.filterSelectContent}
          align="start"
          sideOffset={6}
          collisionPadding={16}
        >
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className={styles.filterSelectItem}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function OverviewFilters({
  applied,
  options,
  now,
  pending,
  onApply,
  onReset,
}: {
  applied: OverviewQuery;
  options: OverviewOptions;
  now: string;
  pending: boolean;
  onApply: (query: OverviewQuery) => void;
  onReset: () => void;
}) {
  const [draft, setDraft] = useState(applied);
  const [period, setPeriod] = useState<OverviewPeriod>("month");
  const [error, setError] = useState("");
  const dirty = JSON.stringify(draft) !== JSON.stringify(applied);
  const regions = options.regions.filter(
    (region) => draft.district === "all" || region.district === draft.district,
  );
  const territories = regions
    .filter(
      (region) => draft.regionId === "all" || region.id === draft.regionId,
    )
    .flatMap((region) => region.territories);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.from || !draft.to || draft.from > draft.to) {
      setError("Choose a start date on or before the end date.");
      return;
    }
    setError("");
    onApply(draft);
  }
  function reset() {
    setPeriod("month");
    setDraft(defaultQuery(now));
    setError("");
    onReset();
  }
  return (
    <form
      className={styles.filters}
      onSubmit={submit}
      aria-label="Dashboard filters"
    >
      <div className={styles.filterHeading}>
        <div>
          <Filter size={15} aria-hidden="true" />
          <span>Reporting scope</span>
        </div>
        <p>
          {displayDay(applied.from)} – {displayDay(applied.to)}{" "}
          <span>· Saudi time</span>
        </p>
      </div>
      <div className={styles.filterGrid}>
        <OverviewFilterSelect
          label="Period"
          accessibleLabel="Reporting period"
          value={period}
          options={PERIOD_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          onValueChange={(value) => {
            const nextPeriod = value as OverviewPeriod;
            setPeriod(nextPeriod);
            if (nextPeriod !== "custom")
              setDraft((current) => ({
                ...current,
                ...periodDates(nextPeriod, now),
              }));
          }}
        />
        <OverviewFilterSelect
          label="Medical representative"
          value={draft.repId}
          options={[
            { value: "all", label: "All medical reps" },
            ...options.reps.map((rep) => ({ value: rep.id, label: rep.name })),
          ]}
          onValueChange={(repId) =>
            setDraft((current) => ({ ...current, repId }))
          }
        />
        <OverviewFilterSelect
          label="District"
          value={draft.district}
          options={[
            { value: "all", label: "All districts" },
            ...options.districts.map((district) => ({
              value: district,
              label: district,
            })),
          ]}
          onValueChange={(district) =>
            setDraft((current) => ({
              ...current,
              district,
              regionId: "all",
              territoryId: "all",
            }))
          }
        />
        <OverviewFilterSelect
          label="Region"
          value={draft.regionId}
          options={[
            { value: "all", label: "All regions" },
            ...regions.map((region) => ({
              value: region.id,
              label: region.name,
            })),
          ]}
          onValueChange={(regionId) =>
            setDraft((current) => ({
              ...current,
              regionId,
              territoryId: "all",
            }))
          }
        />
        <OverviewFilterSelect
          label="Territory"
          value={draft.territoryId}
          options={[
            { value: "all", label: "All territories" },
            ...territories.map((territory) => ({
              value: territory.id,
              label: territory.name,
            })),
          ]}
          onValueChange={(territoryId) =>
            setDraft((current) => ({ ...current, territoryId }))
          }
        />
        <div className={styles.filterActions}>
          <Button
            type="submit"
            disabled={pending}
            className="bg-gp-navy-900 hover:bg-gp-navy-850 h-10 rounded-[10px] px-4 text-white"
          >
            {pending ? "Updating…" : "Apply filters"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={pending}
            onClick={reset}
            aria-label="Reset dashboard filters"
            className="border-gp-border-control h-10 w-10 rounded-[10px]"
          >
            <RotateCcw size={15} />
          </Button>
        </div>
      </div>
      {period === "custom" && (
        <div className={styles.customDates}>
          <CalendarDays size={16} aria-hidden="true" />
          <label>
            From
            <input
              type="date"
              aria-label="Start date"
              required
              value={draft.from}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  from: event.target.value,
                }))
              }
            />
          </label>
          <label>
            To
            <input
              type="date"
              aria-label="End date"
              required
              value={draft.to}
              onChange={(event) =>
                setDraft((current) => ({ ...current, to: event.target.value }))
              }
            />
          </label>
        </div>
      )}
      {error && (
        <p role="alert" className={styles.formError}>
          {error}
        </p>
      )}
      {dirty && !pending && !error && (
        <p className={styles.draftNotice}>
          Apply filters to update the dashboard.
        </p>
      )}
    </form>
  );
}
