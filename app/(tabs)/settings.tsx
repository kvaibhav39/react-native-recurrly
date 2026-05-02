import { styled } from "nativewind";
import { Text } from "react-native";
import { SafeAreaView as RNSSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSSafeAreaView);

const Settings = () => {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text>Settings</Text>
    </SafeAreaView>
  );
};
export default Settings;
