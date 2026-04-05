import { Link } from "expo-router";
import { Text, View } from "react-native";

const SignIn = () => {
  return (
    <View>
      <Text>SignIn</Text>
      <Link
        href="/(auth)/sign-up"
        className="mt-4 rounded-md bg-accent px-4 py-2"
      >
        Sign Up
      </Link>
      <Link href="/" className="mt-4 rounded-md bg-accent px-4 py-2">
        Home
      </Link>
    </View>
  );
};
export default SignIn;
