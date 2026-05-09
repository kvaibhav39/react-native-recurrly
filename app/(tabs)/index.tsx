import { HOME_BALANCE, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import "@/global.css";
import CreateSubscriptionModal from "@/src/components/CreateSubscriptionModal";
import { useSubscriptions } from "@/src/context/SubscriptionsContext";
import { useUser } from "@clerk/expo";
import { clerkDisplayName } from "@/lib/clerkProfile";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { useMemo, useState } from "react";
import { usePostHog } from "posthog-react-native";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSSafeAreaView } from "react-native-safe-area-context";
import ListHeading from "../components/ListHeading";
import SubscriptionCard from "../components/SubscriptionCard";
import UpcomingSubscriptionCard from "../components/UpcomingSubscriptionCard";

const SafeAreaView = styled(RNSSafeAreaView);

export default function App() {
  const { user, isLoaded } = useUser();
  const posthog = usePostHog();
  const { subscriptions } = useSubscriptions();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  const displayName = useMemo(
    () => clerkDisplayName(user) || "Account",
    [user],
  );

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <CreateSubscriptionModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
      />
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <View className="home-user">
                <Image
                  source={
                    user?.imageUrl
                      ? { uri: user.imageUrl }
                      : images.avatar
                  }
                  className="home-avatar"
                />
                <Text className="home-user-name">
                  {isLoaded ? displayName : "…"}
                </Text>
              </View>
              <Pressable
                onPress={() => setCreateModalVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="Add subscription"
              >
                <Image source={icons.add} className="home-add-icon" />
              </Pressable>
            </View>
            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>
              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date">
                  {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
                </Text>
              </View>
            </View>
            <View className="mb-5">
              <ListHeading title="Upcoming" />
              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item }) => (
                  <UpcomingSubscriptionCard {...item} />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={<Text>No upcoming renewals yet.</Text>}
              />
            </View>
            <ListHeading title="All Subscriptions" />
          </>
        )}
        data={subscriptions}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => {
              const isExpanding = expandedSubscriptionId !== item.id;
              if (isExpanding) {
                posthog.capture("subscription_card_expanded", {
                  subscription_id: item.id,
                  subscription_name: item.name,
                  billing: item.billing,
                  ...(item.category !== undefined
                    ? { category: item.category }
                    : {}),
                });
              }
              setExpandedSubscriptionId((currentId: string | null) =>
                currentId === item.id ? null : item.id,
              );
            }}
          />
        )}
        extraData={expandedSubscriptionId}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text>No subscriptions yet.</Text>}
        contentContainerClassName="pb-30"
      />
    </SafeAreaView>
  );
}
