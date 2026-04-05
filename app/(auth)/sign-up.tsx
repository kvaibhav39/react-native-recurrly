import { Link } from "expo-router";
import { Text, View } from "react-native";

const SignUp = () => {
  return (
    <View>
      <Text>SignUp</Text>
      <Link
        href="/(auth)/sign-in1"
        className="mt-4 rounded-md bg-accent px-4 py-2"
      >
        Sign In
      </Link>
    </View>
  );
};
export default SignUp;
