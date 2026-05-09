import images from "@/constants/images";
import { clerkDisplayName } from "@/lib/clerkProfile";
import { useClerk, useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { useMemo, useState } from "react";
import { usePostHog } from "posthog-react-native";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView as RNSSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSSafeAreaView);

function ProfileRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value?.trim()) return null;
  return (
    <View className="border-b border-border py-3 last:border-b-0">
      <Text className="text-sm font-sans-medium text-muted-foreground">
        {label}
      </Text>
      <Text className="mt-1 text-base font-sans-semibold text-primary">
        {value}
      </Text>
    </View>
  );
}

const Settings = () => {
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const posthog = usePostHog();
  const [signingOut, setSigningOut] = useState(false);

  const displayName = useMemo(
    () => (user ? clerkDisplayName(user) : ""),
    [user],
  );

  const primaryEmail = user?.primaryEmailAddress?.emailAddress ?? "";
  const username = user?.username ?? "";
  const createdLabel = useMemo(() => {
    if (!user?.createdAt) return "";
    const t = user.createdAt;
    const ms = typeof t === "number" ? t : new Date(t).getTime();
    return dayjs(ms).format("MMM D, YYYY");
  }, [user?.createdAt]);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      posthog.capture("sign_out");
      posthog.reset();
      await signOut();
    } catch {
      // Show a toast/banner here so failures aren't silent.
    } finally {
      setSigningOut(false);
    }
  };

  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#ea7a53" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-5 pb-30"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-5 text-2xl font-sans-bold text-primary">
          Settings
        </Text>

        <View className="mb-6 rounded-3xl border border-border bg-card p-5">
          <View className="mb-5 flex-row items-center gap-4">
            <Image
              source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar}
              className="size-20 rounded-full"
            />
            <View className="min-w-0 flex-1">
              <Text
                className="text-xl font-sans-bold text-primary"
                numberOfLines={2}
              >
                {displayName || "Account"}
              </Text>
              {primaryEmail ? (
                <Text
                  className="mt-1 text-sm font-sans-medium text-muted-foreground"
                  numberOfLines={2}
                >
                  {primaryEmail}
                </Text>
              ) : null}
            </View>
          </View>

          <View className="rounded-2xl border border-border bg-background px-4">
            <ProfileRow label="Email" value={primaryEmail} />
            <ProfileRow label="Username" value={username} />
            <ProfileRow label="Member since" value={createdLabel} />
          </View>
        </View>

        <TouchableOpacity
          className="auth-button bg-primary"
          disabled={signingOut}
          onPress={() => {
            void handleSignOut();
          }}
        >
          {signingOut ? (
            <ActivityIndicator color="#fff9e3" />
          ) : (
            <Text className="auth-button-text text-background">Sign out</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;
