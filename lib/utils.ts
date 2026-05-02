/**
 * Formats a number as U.S.-style money ($ and two decimal places).
 * Uses `en-US` locale. Defaults to USD. Invalid numbers become `$0.00`.
 */
export function formatCurrency(
  value: number,
  currency: string = "USD"
): string {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return "$0.00";
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    const abs = Math.abs(n);
    const sign = n < 0 ? "-" : "";
    const [intPart, decPart] = abs.toFixed(2).split(".");
    const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${sign}$${withCommas}.${decPart}`;
  }
}
