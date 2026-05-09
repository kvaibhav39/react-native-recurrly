import { icons } from "@/constants/icons";
import { useSubscriptions } from "@/src/context/SubscriptionsContext";
import clsx from "clsx";
import dayjs from "dayjs";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { posthog } from "../config/posthog";

const CATEGORY_OPTIONS = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

type CategoryOption = (typeof CATEGORY_OPTIONS)[number];

const CATEGORY_COLORS: Record<CategoryOption, string> = {
  Entertainment: "#f5c8e8",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#f5c542",
  Productivity: "#c8e6c9",
  Cloud: "#90caf9",
  Music: "#ce93d8",
  Other: "#e0e0e0",
};

type BillingChoice = "Monthly" | "Yearly";

type CreateSubscriptionModalProps = {
  visible: boolean;
  onClose: () => void;
};

function parsePositivePrice(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const n = Number.parseFloat(trimmed.replace(",", "."));
  if (Number.isNaN(n) || n <= 0) return null;
  return n;
}

export default function CreateSubscriptionModal({
  visible,
  onClose,
}: CreateSubscriptionModalProps) {
  const { addSubscription } = useSubscriptions();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [priceText, setPriceText] = useState("");
  const [billing, setBilling] = useState<BillingChoice>("Monthly");
  const [category, setCategory] = useState<CategoryOption>("Entertainment");

  const reset = () => {
    setName("");
    setPriceText("");
    setBilling("Monthly");
    setCategory("Entertainment");
  };

  const priceValue = parsePositivePrice(priceText);
  const nameOk = name.trim().length > 0;
  const formValid = nameOk && priceValue !== null;

  const handleSubmit = () => {
    if (!formValid || priceValue === null) return;

    const start = dayjs();
    const renewal =
      billing === "Monthly" ? start.add(1, "month") : start.add(1, "year");

    const subscription: Subscription = {
      id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      icon: icons.plus,
      name: name.trim(),
      price: priceValue,
      currency: "USD",
      billing,
      category,
      status: "active",
      startDate: start.toISOString(),
      renewalDate: renewal.toISOString(),
      color: CATEGORY_COLORS[category],
    };

    addSubscription(subscription);
    posthog.capture("subscription_created", {
      subscription_id: subscription.id,
      subscription_name: subscription.name,
      billing: subscription.billing,
      ...(subscription.category !== undefined
        ? { category: subscription.category }
        : {}),
    });
    reset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <Pressable
          className="absolute inset-0 bg-black/50"
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="w-full"
        >
          <View
            className="modal-container"
            style={{ paddingBottom: Math.max(insets.bottom, 16) }}
          >
            <View className="modal-header">
              <Text className="modal-title">New Subscription</Text>
              <Pressable
                onPress={onClose}
                className="modal-close"
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Text className="modal-close-text">×</Text>
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
              contentContainerClassName="gap-5 p-5"
            >
              <View className="auth-field">
                <Text className="auth-label">Name</Text>
                <TextInput
                  className="auth-input"
                  value={name}
                  onChangeText={setName}
                  placeholder="Subscription name"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  autoCapitalize="sentences"
                  autoCorrect
                />
              </View>

              <View className="auth-field">
                <Text className="auth-label">Price</Text>
                <TextInput
                  className="auth-input"
                  value={priceText}
                  onChangeText={setPriceText}
                  placeholder="0.00"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  keyboardType="decimal-pad"
                />
              </View>

              <View className="auth-field">
                <Text className="auth-label">Frequency</Text>
                <View className="picker-row">
                  <TouchableOpacity
                    className={clsx(
                      "picker-option",
                      billing === "Monthly" && "picker-option-active",
                    )}
                    onPress={() => setBilling("Monthly")}
                    activeOpacity={0.85}
                  >
                    <Text
                      className={clsx(
                        "picker-option-text",
                        billing === "Monthly" && "picker-option-text-active",
                      )}
                    >
                      Monthly
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={clsx(
                      "picker-option",
                      billing === "Yearly" && "picker-option-active",
                    )}
                    onPress={() => setBilling("Yearly")}
                    activeOpacity={0.85}
                  >
                    <Text
                      className={clsx(
                        "picker-option-text",
                        billing === "Yearly" && "picker-option-text-active",
                      )}
                    >
                      Yearly
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View className="auth-field">
                <Text className="auth-label">Category</Text>
                <View className="category-scroll">
                  {CATEGORY_OPTIONS.map((option) => {
                    const active = category === option;
                    return (
                      <TouchableOpacity
                        key={option}
                        className={clsx(
                          "category-chip",
                          active && "category-chip-active",
                        )}
                        onPress={() => setCategory(option)}
                        activeOpacity={0.85}
                      >
                        <Text
                          className={clsx(
                            "category-chip-text",
                            active && "category-chip-text-active",
                          )}
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <TouchableOpacity
                className={clsx(
                  "auth-button",
                  !formValid && "auth-button-disabled",
                )}
                onPress={handleSubmit}
                disabled={!formValid}
                activeOpacity={0.9}
              >
                <Text className="auth-button-text">Add subscription</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
