import "@/global.css";
import { Link } from "expo-router";
import { styled } from "nativewind";
import { Text } from "react-native";
import { SafeAreaView as RNSSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSSafeAreaView);

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-xl font-bold text-success">
        Welcome to Nativewind!
      </Text>
      <Link href="/onboarding" className="mt-4 rounded-md bg-accent px-4 py-2">
        Onboarding
      </Link>
      <Link
        href="/(auth)/sign-in"
        className="mt-4 rounded-md bg-accent px-4 py-2"
      >
        Sign In
      </Link>
      <Link
        href="/(auth)/sign-up"
        className="mt-4 rounded-md bg-accent px-4 py-2"
      >
        Sign Up
      </Link>
      <Link
        href="/subscriptions/spotify"
        className="mt-4 rounded-md bg-accent px-4 py-2"
      >
        Spotify
      </Link>
      <Link
        href={{
          pathname: "/subscriptions/[id]",
          params: { id: "netflix" },
        }}
        className="mt-4 rounded-md bg-accent px-4 py-2"
      >
        Netflix
      </Link>
    </SafeAreaView>
  );
}
