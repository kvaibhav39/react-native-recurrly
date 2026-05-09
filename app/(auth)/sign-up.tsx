import AuthShell from "@/app/components/auth/AuthShell";
import {
  AUTH_CLIENT_ISSUE_MESSAGES,
  type AuthClientIssue,
} from "@/lib/authClientIssues";
import { getClerkCallError, uniqueAuthMessages } from "@/lib/clerkErrors";
import { useSignUp } from "@clerk/expo";
import clsx from "clsx";
import { Link, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

function isValidEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(value.trim());
}

export default function SignUp() {
  const router = useRouter();
  const { signUp, errors, fetchStatus } = useSignUp();

  const [step, setStep] = useState<"form" | "verify">("form");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");

  /** API / Clerk catch messages only (not client submit hints). */
  const [formError, setFormError] = useState<string | null>(null);
  const [clientIssue, setClientIssue] = useState<AuthClientIssue>(null);
  /** Hide stale `errors.fields` from Clerk until the next API call. */
  const [suppressClerkErrors, setSuppressClerkErrors] = useState(false);

  const submitting = fetchStatus === "fetching";

  const subtitle = useMemo(() => {
    return step === "form"
      ? "Create your account with email and password."
      : "Enter the verification code we emailed you.";
  }, [step]);

  const emailInvalid =
    step === "form" && email.trim().length > 0 && !isValidEmail(email);

  const passwordTooShort =
    step === "form" && password.length > 0 && password.length < 8;

  const passwordsMismatch =
    step === "form" &&
    confirmPassword.length > 0 &&
    password !== confirmPassword;

  const createAndSendVerification = async () => {
    setSuppressClerkErrors(false);
    setFormError(null);
    try {
      const pwResult = await signUp.password({
        emailAddress: email.trim(),
        password,
      });
      const pwErr = getClerkCallError(pwResult);
      if (pwErr) {
        setFormError(pwErr);
        return;
      }

      const sendResult = await signUp.verifications.sendEmailCode();
      const sendErr = getClerkCallError(sendResult);
      if (sendErr) {
        setFormError(sendErr);
        return;
      }

      setClientIssue(null);
      setStep("verify");
    } catch (err: any) {
      setFormError(
        err?.errors?.[0]?.longMessage ?? err?.message ?? "Sign up failed.",
      );
    }
  };

  const verifyCode = async () => {
    setSuppressClerkErrors(false);
    setFormError(null);
    try {
      await signUp.verifications.verifyEmailCode({ code: code.trim() });

      if (signUp.status === "complete") {
        await signUp.finalize({
          navigate: async () => router.replace("/(tabs)"),
        });
      } else {
        setFormError("Verification is not complete yet.");
      }
    } catch (err: any) {
      setFormError(
        err?.errors?.[0]?.longMessage ?? err?.message ?? "Invalid code.",
      );
    }
  };

  const onPrimaryPress = async () => {
    if (submitting) return;

    if (!email.trim()) {
      setClientIssue("email_required");
      return;
    }
    if (!isValidEmail(email)) {
      return;
    }

    if (step === "form") {
      if (!password.trim()) {
        setClientIssue("password_required");
        return;
      }
      if (password.length < 8) {
        return;
      }
      if (!confirmPassword.trim()) {
        setClientIssue("password_confirm_required");
        return;
      }
      if (password !== confirmPassword) {
        setClientIssue("password_mismatch");
        return;
      }
      await createAndSendVerification();
      return;
    }

    if (!code.trim()) {
      setClientIssue("code_required");
      return;
    }
    if (code.trim().length < 4) {
      setClientIssue("code_short");
      return;
    }

    await verifyCode();
  };

  const primaryLabel = step === "form" ? "Create account" : "Verify code";

  const authMessages = uniqueAuthMessages([
    ...(suppressClerkErrors
      ? []
      : [
          errors?.fields?.emailAddress?.message,
          errors?.fields?.password?.message,
          errors?.fields?.code?.message,
        ]),
    formError,
    clientIssue ? AUTH_CLIENT_ISSUE_MESSAGES[clientIssue] : null,
  ]);

  return (
    <AuthShell title="Create your account" subtitle={subtitle}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="auth-form">
          <View className="auth-field">
            <Text className="auth-label">Email</Text>
            <TextInput
              className={clsx("auth-input", emailInvalid && "auth-input-error")}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor="rgba(0,0,0,0.35)"
              value={email}
              editable={!submitting && step === "form"}
              onChangeText={(value) => {
                setEmail(value);
                setSuppressClerkErrors(true);
                setFormError(null);
                setClientIssue((issue) =>
                  issue === "email_required" && value.trim() ? null : issue,
                );
              }}
              returnKeyType="next"
            />
            {emailInvalid ? (
              <Text className="auth-error">
                Enter a valid email address (e.g. name@example.com).
              </Text>
            ) : null}
          </View>

          {step === "form" ? (
            <>
              <View className="auth-field">
                <Text className="auth-label">Password</Text>
                <TextInput
                  className="auth-input"
                  secureTextEntry
                  placeholder="At least 8 characters"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  value={password}
                  editable={!submitting}
                  onChangeText={(value) => {
                    setPassword(value);
                    setSuppressClerkErrors(true);
                    setFormError(null);
                    setClientIssue((issue) => {
                      if (issue === "password_required" && value.trim()) {
                        return null;
                      }
                      if (
                        issue === "password_mismatch" &&
                        value === confirmPassword
                      ) {
                        return null;
                      }
                      return issue;
                    });
                  }}
                  returnKeyType="next"
                />
                {passwordTooShort ? (
                  <Text className="auth-error">
                    Password must be at least 8 characters.
                  </Text>
                ) : (
                  <Text className="auth-helper">Use 8 or more characters.</Text>
                )}
              </View>
              <View className="auth-field">
                <Text className="auth-label">Confirm password</Text>
                <TextInput
                  className={clsx(
                    "auth-input",
                    passwordsMismatch && "auth-input-error",
                  )}
                  secureTextEntry
                  placeholder="Re-enter your password"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  value={confirmPassword}
                  editable={!submitting}
                  onChangeText={(value) => {
                    setConfirmPassword(value);
                    setSuppressClerkErrors(true);
                    setFormError(null);
                    setClientIssue((issue) => {
                      if (
                        issue === "password_confirm_required" &&
                        value.trim()
                      ) {
                        return null;
                      }
                      if (issue === "password_mismatch" && value === password) {
                        return null;
                      }
                      return issue;
                    });
                  }}
                  returnKeyType="done"
                />
                {passwordsMismatch ? (
                  <Text className="auth-error">Passwords do not match.</Text>
                ) : (
                  <Text className="auth-helper">
                    Must match the password above.
                  </Text>
                )}
              </View>
            </>
          ) : null}

          {step === "verify" ? (
            <View className="auth-field">
              <Text className="auth-label">Verification code</Text>
              <TextInput
                className="auth-input"
                keyboardType="number-pad"
                placeholder="123456"
                placeholderTextColor="rgba(0,0,0,0.35)"
                value={code}
                editable={!submitting}
                onChangeText={(value) => {
                  setCode(value);
                  setSuppressClerkErrors(true);
                  setFormError(null);
                  setClientIssue((issue) => {
                    if (issue === "code_required" && value.trim()) return null;
                    if (issue === "code_short" && value.trim().length >= 4) {
                      return null;
                    }
                    return issue;
                  });
                }}
                returnKeyType="done"
              />
              <TouchableOpacity
                className="auth-secondary-button"
                onPress={async () => {
                  if (submitting) return;
                  setSuppressClerkErrors(false);
                  setFormError(null);
                  try {
                    await signUp.verifications.sendEmailCode();
                  } catch (err: any) {
                    setFormError(
                      err?.errors?.[0]?.longMessage ??
                        err?.message ??
                        "Unable to resend code.",
                    );
                  }
                }}
                disabled={submitting}
              >
                <Text className="auth-secondary-button-text">Resend code</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {authMessages.map((msg, i) => (
            <Text key={`${i}-${msg.slice(0, 24)}`} className="auth-error">
              {msg}
            </Text>
          ))}

          <TouchableOpacity
            className={
              submitting ? "auth-button auth-button-disabled" : "auth-button"
            }
            onPress={onPrimaryPress}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator />
            ) : (
              <Text className="auth-button-text">{primaryLabel}</Text>
            )}
          </TouchableOpacity>

          <View className="auth-link-row">
            <Text className="auth-link-copy">Already have an account?</Text>
            <Link href="/(auth)/sign-in" className="auth-link">
              Sign in
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </AuthShell>
  );
}
