import CategoryBarRow from "@/src/components/insights/CategoryBarRow";
import InsightStatCard from "@/src/components/insights/InsightStatCard";
import { useSubscriptions } from "@/src/context/SubscriptionsContext";
import {
  computeInsightsMetrics,
  monthlyTotalPrimaryBucket,
} from "@/lib/subscriptionMetrics";
import { formatCurrency } from "@/lib/utils";
import { useFocusEffect } from "@react-navigation/native";
import dayjs from "dayjs";
import { usePostHog } from "posthog-react-native";
import { useCallback, useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { styled } from "nativewind";
import { SafeAreaView as RNSSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSSafeAreaView);

function sectionTitle(title: string, withTopMargin: boolean) {
  return (
    <Text
      className={`mb-3 text-lg font-sans-bold text-primary ${withTopMargin ? "mt-8" : ""}`}
    >
      {title}
    </Text>
  );
}

export default function Insights() {
  const { subscriptions } = useSubscriptions();
  const posthog = usePostHog();

  const metrics = useMemo(
    () => computeInsightsMetrics(subscriptions, 30),
    [subscriptions],
  );

  const totalActiveMonthlySum = useMemo(
    () =>
      Object.values(metrics.activeMonthlyByCurrency).reduce((a, b) => a + b, 0),
    [metrics.activeMonthlyByCurrency],
  );

  useFocusEffect(
    useCallback(() => {
      const m = computeInsightsMetrics(subscriptions, 30);
      posthog.capture("insights_viewed", {
        active_count: m.activeCount,
        monthly_total_bucket: monthlyTotalPrimaryBucket(m.activeMonthlyByCurrency),
        subscription_total: subscriptions.length,
      });
    }, [subscriptions, posthog]),
  );

  if (subscriptions.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background p-5">
        <Text className="list-title">Insights</Text>
        <Text className="mt-2 text-base text-muted-foreground">
          Based on your subscriptions
        </Text>
        <Text className="mt-6 text-base font-sans-medium text-primary">
          No subscriptions yet. Add some on Home to see monthly spend estimates,
          category breakdown, and renewal totals for the next 30 days.
        </Text>
      </SafeAreaView>
    );
  }

  const monthlyBucket = monthlyTotalPrimaryBucket(
    metrics.activeMonthlyByCurrency,
  );
  const monthlyA11y = `Estimated monthly spend for active subscriptions, ${metrics.activeCount} active, bucket ${monthlyBucket}`;
  const yearlyA11y = `Estimated yearly run rate from active subscriptions, bucket ${monthlyBucket}`;

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-30">
        <Text className="list-title">Insights</Text>
        <Text className="mt-2 text-base text-muted-foreground">
          Based on your subscriptions (active subs for spend totals).
        </Text>

        {sectionTitle("Spend overview", false)}
        <View className="flex-row gap-3">
          <View className="min-w-0 flex-1">
            <InsightStatCard
              label="Est. monthly (active)"
              amountsByCurrency={metrics.activeMonthlyByCurrency}
              accessibilityLabel={monthlyA11y}
            />
          </View>
          <View className="min-w-0 flex-1">
            <InsightStatCard
              label="Est. yearly run rate"
              amountsByCurrency={metrics.activeYearlyRunRateByCurrency}
              accessibilityLabel={yearlyA11y}
            />
          </View>
        </View>

        {metrics.categoryRows.length > 0 ? (
          <>
            {sectionTitle("By category (active)", true)}
            {metrics.categoryRows.map((row) => {
              const rowSum = Object.values(row.monthlyByCurrency).reduce(
                (a, b) => a + b,
                0,
              );
              const sharePercent =
                totalActiveMonthlySum > 0
                  ? (rowSum / totalActiveMonthlySum) * 100
                  : 0;
              return (
                <CategoryBarRow
                  key={row.category}
                  category={row.category}
                  monthlyByCurrency={row.monthlyByCurrency}
                  sharePercent={sharePercent}
                />
              );
            })}
          </>
        ) : null}

        {sectionTitle("By status", true)}
        <View className="rounded-2xl border border-border bg-card px-4">
          {metrics.statusRows.map((row, index) => {
            const moneyParts = Object.entries(row.monthlyByCurrency)
              .filter(([, v]) => v > 0)
              .map(([c, v]) => formatCurrency(v, c));
            const spendLabel =
              moneyParts.length > 0 ? moneyParts.join(" · ") : "—";
            return (
              <View
                key={row.status}
                className={`flex-row items-center justify-between py-3 ${
                  index < metrics.statusRows.length - 1
                    ? "border-b border-border"
                    : ""
                }`}
                accessibilityLabel={`${row.status}, ${row.count} subscriptions, monthly equivalent ${spendLabel}`}
              >
                <Text className="font-sans-semibold text-primary">{row.status}</Text>
                <View className="items-end">
                  <Text className="text-sm font-sans-medium text-muted-foreground">
                    {row.count} sub{row.count === 1 ? "" : "s"}
                  </Text>
                  <Text className="mt-0.5 text-sm font-sans-semibold text-primary">
                    {spendLabel}/mo eq.
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {sectionTitle("Upcoming charges (30 days)", true)}
        <Text className="mb-3 text-sm text-muted-foreground">
          Next invoice amounts on renewal (not annualized). Excludes cancelled.
        </Text>
        {metrics.upcoming.rows.length === 0 ? (
          <Text className="text-base font-sans-medium text-primary">
            No renewals in the next {metrics.upcoming.windowDays} days.
          </Text>
        ) : (
          <>
            <View className="rounded-2xl border border-border bg-card px-4">
              {metrics.upcoming.rows.map((row, index) => (
                <View
                  key={row.id}
                  className={`flex-row items-center justify-between py-3 ${
                    index < metrics.upcoming.rows.length - 1
                      ? "border-b border-border"
                      : ""
                  }`}
                >
                  <View className="mr-3 min-w-0 flex-1">
                    <Text className="font-sans-semibold text-primary" numberOfLines={1}>
                      {row.name}
                    </Text>
                    <Text className="mt-0.5 text-sm text-muted-foreground">
                      {dayjs(row.renewalDate).format("MMM D, YYYY")}
                    </Text>
                  </View>
                  <Text className="font-sans-semibold text-primary">
                    {formatCurrency(row.price, row.currency)}
                  </Text>
                </View>
              ))}
            </View>
            <View className="mt-3 flex-row flex-wrap justify-end gap-x-2">
              {Object.entries(metrics.upcoming.totalByCurrency).map(([c, v]) => (
                <Text
                  key={c}
                  className="text-sm font-sans-semibold text-muted-foreground"
                >
                  Total ({c}): {formatCurrency(v, c)}
                </Text>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
