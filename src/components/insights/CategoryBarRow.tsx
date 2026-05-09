import { formatCurrency } from "@/lib/utils";
import type { MoneyByCurrency } from "@/lib/subscriptionMetrics";
import { Text, View } from "react-native";

type CategoryBarRowProps = {
  category: string;
  monthlyByCurrency: MoneyByCurrency;
  sharePercent: number;
};

function primaryAmount(m: MoneyByCurrency): { currency: string; value: number } | null {
  const entries = Object.entries(m).filter(([, v]) => v > 0);
  if (entries.length === 0) return null;
  entries.sort((a, b) => b[1] - a[1]);
  const top = entries[0];
  if (!top) return null;
  const [currency, value] = top;
  return { currency, value };
}

export default function CategoryBarRow({
  category,
  monthlyByCurrency,
  sharePercent,
}: CategoryBarRowProps) {
  const primary = primaryAmount(monthlyByCurrency);
  const widthPct = Math.min(100, Math.max(0, sharePercent));
  const amountLabel = primary
    ? formatCurrency(primary.value, primary.currency)
    : "—";
  const a11y = `${category}, ${amountLabel}, ${widthPct.toFixed(0)} percent of active spend`;

  return (
    <View className="mb-4" accessibilityLabel={a11y}>
      <View className="flex-row items-center justify-between">
        <Text className="font-sans-semibold text-primary">{category}</Text>
        <Text className="font-sans-medium text-muted-foreground">{amountLabel}</Text>
      </View>
      <View className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <View
          className="h-full rounded-full bg-subscription"
          style={{ width: `${widthPct}%` }}
        />
      </View>
    </View>
  );
}
