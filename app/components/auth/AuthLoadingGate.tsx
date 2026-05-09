import { ActivityIndicator, View } from "react-native";

export default function AuthLoadingGate() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" color="#ea7a53" />
    </View>
  );
}
