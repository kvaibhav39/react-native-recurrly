import { useSubscriptions } from "@/src/context/SubscriptionsContext";
import { styled } from "nativewind";
import { useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSSafeAreaView } from "react-native-safe-area-context";
import SubscriptionCard from "../components/SubscriptionCard";

const SafeAreaView = styled(RNSSafeAreaView);

function subscriptionMatchesQuery(subscription: Subscription, rawQuery: string) {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return true;
  const parts = [
    subscription.name,
    subscription.plan,
    subscription.category,
    subscription.status,
    subscription.billing,
    subscription.paymentMethod,
  ];
  return parts.some((part) => part?.toLowerCase().includes(q));
}

const Subscriptions = () => {
  const { subscriptions } = useSubscriptions();
  const [query, setQuery] = useState("");
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  const filteredSubscriptions = useMemo(
    () =>
      subscriptions.filter((item) =>
        subscriptionMatchesQuery(item, query),
      ),
    [subscriptions, query],
  );

  const emptyMessage = query.trim()
    ? "No subscriptions match your search."
    : "No subscriptions yet.";

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View className="mb-4">
          <Text className="list-title">Subscriptions</Text>
          <TextInput
            className="auth-input mt-4"
            placeholder="Search by name, category, plan…"
            placeholderTextColor="rgba(0,0,0,0.35)"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
        </View>
        <FlatList
          style={{ flex: 1 }}
          data={filteredSubscriptions}
          renderItem={({ item }) => (
            <SubscriptionCard
              {...item}
              expanded={expandedSubscriptionId === item.id}
              onPress={() =>
                setExpandedSubscriptionId((currentId) =>
                  currentId === item.id ? null : item.id,
                )
              }
            />
          )}
          extraData={expandedSubscriptionId}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View className="h-4" />}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          ListEmptyComponent={<Text>{emptyMessage}</Text>}
          contentContainerClassName="pb-30 grow"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Subscriptions;
