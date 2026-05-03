import { formatCurrency } from "@/lib/utils";
import { Image, Text, View } from "react-native";
const UpcomingSubscriptionCard = (data: UpcomingSubscription) => {
  return (
    <View className="upcoming-card">
      <View className="upcoming-row">
        <Image source={data.icon} className="upcoming-icon" />
        <View>
          <Text className="upcoming-price">
            {formatCurrency(data.price, data.currency)}
          </Text>
          <Text className="upcoming-meta">
            {data.daysLeft > 1 ? `${data.daysLeft} days left` : "Last day"}
          </Text>
        </View>
      </View>
      <Text className="upcoming-name">{data.name}</Text>
    </View>
  );
};
export default UpcomingSubscriptionCard;
