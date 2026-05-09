import type { useUser } from "@clerk/expo";

type ClerkUser = ReturnType<typeof useUser>["user"];

export function clerkDisplayName(user: ClerkUser): string {
  if (!user) return "";
  const full = user.fullName?.trim();
  if (full) return full;
  const firstLast = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  if (firstLast) return firstLast;
  if (user.username) return user.username;
  const email = user.primaryEmailAddress?.emailAddress;
  if (email) return email.split("@")[0] ?? email;
  return "";
}
