export const CURRENCY_CODE = "SAR" as const;
export const CURRENCY_LABEL_EN = "SAR" as const;
export const CURRENCY_LABEL_AR = "ر.س" as const;
export const CURRENCY_NAME_EN = "Saudi Riyal" as const;

export interface FormatSAROptions {
  locale?: "en" | "ar";
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export function formatSAR(
  amount: number | null | undefined,
  options: FormatSAROptions = {},
): string {
  const {
    locale = "en",
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
  } = options;

  const numeric =
    amount == null || Number.isNaN(Number(amount)) ? 0 : Number(amount);

  const formatted = new Intl.NumberFormat(
    locale === "ar" ? "ar-SA" : "en-US",
    {
      minimumFractionDigits,
      maximumFractionDigits,
    },
  ).format(numeric);

  return locale === "ar"
    ? `${formatted} ${CURRENCY_LABEL_AR}`
    : `${CURRENCY_LABEL_EN} ${formatted}`;
}
