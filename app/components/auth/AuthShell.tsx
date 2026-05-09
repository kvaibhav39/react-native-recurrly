import { styled } from "nativewind";
import { ReactNode } from "react";
import { ScrollView as RNScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSSafeAreaView);
const ScrollView = styled(RNScrollView);

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function AuthShell({ title, subtitle, children }: Props) {
  return (
    <SafeAreaView className="auth-safe-area" style={{ flex: 1 }}>
      <ScrollView
        className="auth-scroll"
        contentContainerClassName="auth-content"
        keyboardShouldPersistTaps="handled"
      >
        <View className="auth-brand-block">
          <View className="auth-logo-wrap">
            <View className="auth-logo-mark">
              <Text className="auth-logo-mark-text">R</Text>
            </View>
            <View>
              <Text className="auth-wordmark">Recurrly</Text>
              <Text className="auth-wordmark-sub">
                Subscriptions made simple
              </Text>
            </View>
          </View>

          <Text className="auth-title">{title}</Text>
          {subtitle ? <Text className="auth-subtitle">{subtitle}</Text> : null}
        </View>

        <View className="auth-card">{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
