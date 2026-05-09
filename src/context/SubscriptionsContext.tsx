import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type SubscriptionsContextValue = {
  subscriptions: Subscription[];
  addSubscription: (subscription: Subscription) => void;
};

const SubscriptionsContext = createContext<SubscriptionsContextValue | null>(
  null,
);

export function SubscriptionsProvider({ children }: { children: ReactNode }) {
  const [prepended, setPrepended] = useState<Subscription[]>([]);

  const subscriptions = useMemo(
    () => [...prepended, ...HOME_SUBSCRIPTIONS],
    [prepended],
  );

  const addSubscription = useCallback((subscription: Subscription) => {
    setPrepended((prev) => [subscription, ...prev]);
  }, []);

  const value = useMemo(
    () => ({ subscriptions, addSubscription }),
    [subscriptions, addSubscription],
  );

  return (
    <SubscriptionsContext.Provider value={value}>
      {children}
    </SubscriptionsContext.Provider>
  );
}

export function useSubscriptions() {
  const ctx = useContext(SubscriptionsContext);
  if (!ctx) {
    throw new Error(
      "useSubscriptions must be used within a SubscriptionsProvider",
    );
  }
  return ctx;
}
