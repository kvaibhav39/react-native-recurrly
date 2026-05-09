/** Submit-time client validation issues (not from Clerk). Cleared only when that check passes. */
export type AuthClientIssue =
  | null
  | "email_required"
  | "password_required"
  | "password_confirm_required"
  | "password_mismatch"
  | "signin_password_required"
  | "code_required"
  | "code_short";

export const AUTH_CLIENT_ISSUE_MESSAGES: Record<
  Exclude<AuthClientIssue, null>,
  string
> = {
  email_required: "Enter your email address.",
  password_required: "Enter a password.",
  password_confirm_required: "Confirm your password.",
  password_mismatch: "Passwords do not match.",
  signin_password_required: "Enter your password.",
  code_required: "Enter the verification code.",
  code_short: "That code looks too short.",
};
