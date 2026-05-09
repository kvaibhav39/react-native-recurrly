import { formatCurrency } from "@/lib/utils";
import type { MoneyByCurrency } from "@/lib/subscriptionMetrics";
import { Text, View } from "react-native";

type InsightStatCardProps = {
  label: string;
  amountsByCurrency: MoneyByCurrency;
  accessibilityLabel?: string;
};

export default function InsightStatCard({
  label,
  amountsByCurrency,
  accessibilityLabel,
}: InsightStatCardProps) {
  const entries = Object.entries(amountsByCurrency).filter(([, v]) => v > 0);

  return (
    <View
      className="rounded-2xl border border-border bg-card p-4"
      accessibilityLabel={accessibilityLabel}
    >
      <Text className="text-sm font-sans-medium text-muted-foreground">{label}</Text>
      {entries.length === 0 ? (
        <Text className="mt-1 text-2xl font-sans-bold text-primary">—</Text>
      ) : (
        entries.map(([currency, value]) => (
          <Text
            key={currency}
            className="mt-1 text-2xl font-sans-bold text-primary"
          >
            {formatCurrency(value, currency)}
          </Text>
        ))
      )}
    </View>
  );
}
