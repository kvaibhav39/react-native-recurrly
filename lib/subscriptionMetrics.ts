import dayjs from "dayjs";

/** Nominal price per billing period → average monthly amount. */
export function monthlyEquivalentAmount(price: number, billing: string): number {
  const b = billing.trim().toLowerCase();
  if (b === "yearly" || b === "annual" || b === "year") return price / 12;
  if (b === "weekly" || b === "week") return (price * 52) / 12;
  return price;
}

export type MoneyByCurrency = Record<string, number>;

function currencyOf(sub: Subscription): string {
  return sub.currency?.trim() || "USD";
}

function addMoney(target: MoneyByCurrency, currency: string, amount: number): void {
  target[currency] = (target[currency] ?? 0) + amount;
}

export function isActiveForSpend(status: string | undefined): boolean {
  if (!status?.trim()) return true;
  return status.trim().toLowerCase() === "active";
}

export function countsTowardUpcomingRenewal(status: string | undefined): boolean {
  return status !== "cancelled";
}

export type CategorySpendRow = {
  category: string;
  monthlyByCurrency: MoneyByCurrency;
};

export type StatusSpendRow = {
  status: string;
  count: number;
  monthlyByCurrency: MoneyByCurrency;
};

export type UpcomingRenewalRow = {
  id: string;
  name: string;
  renewalDate: string;
  price: number;
  currency: string;
};

export type InsightsMetrics = {
  activeMonthlyByCurrency: MoneyByCurrency;
  activeYearlyRunRateByCurrency: MoneyByCurrency;
  activeCount: number;
  categoryRows: CategorySpendRow[];
  statusRows: StatusSpendRow[];
  upcoming: {
    rows: UpcomingRenewalRow[];
    totalByCurrency: MoneyByCurrency;
    windowDays: number;
  };
};

function normalizeStatus(status: string | undefined): string {
  if (!status?.trim()) return "active";
  return status.trim().toLowerCase();
}

function formatStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function computeInsightsMetrics(
  subscriptions: Subscription[],
  upcomingWindowDays = 30,
): InsightsMetrics {
  const activeMonthlyByCurrency: MoneyByCurrency = {};
  let activeCount = 0;

  for (const sub of subscriptions) {
    if (!isActiveForSpend(sub.status)) continue;
    activeCount += 1;
    const m = monthlyEquivalentAmount(sub.price, sub.billing);
    addMoney(activeMonthlyByCurrency, currencyOf(sub), m);
  }

  const activeYearlyRunRateByCurrency: MoneyByCurrency = {};
  for (const [c, v] of Object.entries(activeMonthlyByCurrency)) {
    activeYearlyRunRateByCurrency[c] = v * 12;
  }

  const categoryMap = new Map<string, MoneyByCurrency>();
  for (const sub of subscriptions) {
    if (!isActiveForSpend(sub.status)) continue;
    const cat = sub.category?.trim() || "Uncategorized";
    const bucket = categoryMap.get(cat) ?? {};
    const m = monthlyEquivalentAmount(sub.price, sub.billing);
    addMoney(bucket, currencyOf(sub), m);
    categoryMap.set(cat, bucket);
  }

  const categoryTotalForShare = new Map<string, number>();
  for (const [cat, money] of categoryMap) {
    categoryTotalForShare.set(cat, Object.values(money).reduce((a, b) => a + b, 0));
  }

  const categoryRows: CategorySpendRow[] = [...categoryMap.entries()]
    .map(([category, monthlyByCurrency]) => ({
      category,
      monthlyByCurrency,
      _sort: categoryTotalForShare.get(category) ?? 0,
    }))
    .sort((a, b) => b._sort - a._sort)
    .map(({ category, monthlyByCurrency }) => ({ category, monthlyByCurrency }));

  const statusMap = new Map<
    string,
    { count: number; monthlyByCurrency: MoneyByCurrency }
  >();
  for (const sub of subscriptions) {
    const st = normalizeStatus(sub.status);
    const label = formatStatusLabel(st);
    const cur = statusMap.get(label) ?? {
      count: 0,
      monthlyByCurrency: {},
    };
    cur.count += 1;
    const m = monthlyEquivalentAmount(sub.price, sub.billing);
    addMoney(cur.monthlyByCurrency, currencyOf(sub), m);
    statusMap.set(label, cur);
  }

  const statusRows: StatusSpendRow[] = [...statusMap.entries()]
    .map(([status, v]) => ({ status, ...v }))
    .sort((a, b) => b.count - a.count);

  const now = dayjs();
  const end = now.add(upcomingWindowDays, "day");
  const upcomingRows: UpcomingRenewalRow[] = [];
  const totalByCurrency: MoneyByCurrency = {};

  for (const sub of subscriptions) {
    if (!sub.renewalDate || !countsTowardUpcomingRenewal(sub.status)) continue;
    const d = dayjs(sub.renewalDate);
    if (!d.isValid()) continue;
    if (d.isBefore(now, "day") || d.isAfter(end, "day")) continue;
    upcomingRows.push({
      id: sub.id,
      name: sub.name,
      renewalDate: sub.renewalDate,
      price: sub.price,
      currency: currencyOf(sub),
    });
    addMoney(totalByCurrency, currencyOf(sub), sub.price);
  }

  upcomingRows.sort((a, b) => dayjs(a.renewalDate).valueOf() - dayjs(b.renewalDate).valueOf());

  return {
    activeMonthlyByCurrency,
    activeYearlyRunRateByCurrency,
    activeCount,
    categoryRows,
    statusRows,
    upcoming: {
      rows: upcomingRows,
      totalByCurrency,
      windowDays: upcomingWindowDays,
    },
  };
}

/** Largest single-currency total for coarse analytics buckets (no PII). */
export function monthlyTotalPrimaryBucket(
  money: MoneyByCurrency,
): "none" | "under_50" | "50_100" | "100_250" | "250_plus" {
  const values = Object.values(money);
  if (values.length === 0) return "none";
  const max = Math.max(...values);
  if (max < 50) return "under_50";
  if (max < 100) return "50_100";
  if (max < 250) return "100_250";
  return "250_plus";
}
