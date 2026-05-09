import AuthLoadingGate from "@/app/components/auth/AuthLoadingGate";
import { tabs } from "@/constants/data";
import { SubscriptionsProvider } from "@/src/context/SubscriptionsContext";
import { colors, components } from "@/constants/theme";
import { useAuth } from "@clerk/expo";
import clsx from "clsx";

import { Redirect, Tabs } from "expo-router";
import { Image, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const tabBar = components.tabBar;
const TabLayout = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const insets = useSafeAreaInsets();

  if (!isLoaded) {
    return <AuthLoadingGate />;
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  const TabIcon = ({ focused, icon }: TabIconProps) => {
    return (
      <View className="tabs-icon">
        <View className={clsx("tabs-pill", focused && "tabs-active")}>
          <Image
            source={icon}
            resizeMode="contain"
            style={{ width: 20, height: 20 }}
            className="tabs-glyph"
          />
        </View>
      </View>
    );
  };

  return (
    <SubscriptionsProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            position: "absolute",
            bottom: Math.max(insets.bottom, tabBar.horizontalInset),
            height: tabBar.height,
            marginHorizontal: tabBar.horizontalInset,
            borderRadius: tabBar.radius,
            backgroundColor: colors.primary,
            borderTopWidth: 0,
            elevation: 0,
          },
          tabBarItemStyle: {
            paddingVertical: tabBar.height / 2 - tabBar.iconFrame / 1.6,
          },
          tabBarIconStyle: {
            width: tabBar.iconFrame,
            height: tabBar.iconFrame,
            alignItems: "center",
          },
        }}
      >
        {tabs.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              tabBarIcon: ({ focused }) => (
                <TabIcon focused={focused} icon={tab.icon} />
              ),
            }}
          />
        ))}
      </Tabs>
    </SubscriptionsProvider>
  );
};

export default TabLayout;
