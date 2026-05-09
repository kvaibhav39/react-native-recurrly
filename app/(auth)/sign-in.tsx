import AuthShell from "@/app/components/auth/AuthShell";
import {
  AUTH_CLIENT_ISSUE_MESSAGES,
  type AuthClientIssue,
} from "@/lib/authClientIssues";
import { getClerkCallError, uniqueAuthMessages } from "@/lib/clerkErrors";
import { useSignIn } from "@clerk/expo";
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

type Mode = "password" | "email_code";

function isValidEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(value.trim());
}

export default function SignIn() {
  const router = useRouter();
  const { signIn, errors, fetchStatus } = useSignIn();

  const [mode, setMode] = useState<Mode>("password");
  const [step, setStep] = useState<"form" | "code">("form");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const [formError, setFormError] = useState<string | null>(null);
  const [clientIssue, setClientIssue] = useState<AuthClientIssue>(null);
  const [suppressClerkErrors, setSuppressClerkErrors] = useState(false);

  const submitting = fetchStatus === "fetching";

  const subtitle = useMemo(() => {
    if (mode === "password") {
      return "Sign in with your email and password to continue.";
    }
    return step === "form"
      ? "We’ll email you a one-time code to sign in."
      : "Enter the 6-digit code we sent to your email.";
  }, [mode, step]);

  const emailInvalid =
    step === "form" && email.trim().length > 0 && !isValidEmail(email);

  const passwordTooShort =
    mode === "password" && password.length > 0 && password.length < 8;

  const startEmailCodeFlow = async () => {
    setSuppressClerkErrors(false);
    setFormError(null);
    try {
      await signIn.create({ identifier: email.trim() });
      await signIn.emailCode.sendCode();
      setClientIssue(null);
      setStep("code");
    } catch (err: any) {
      setFormError(
        err?.errors?.[0]?.longMessage ?? err?.message ?? "Unable to send code.",
      );
    }
  };

  const signInWithPassword = async () => {
    setSuppressClerkErrors(false);
    setFormError(null);
    try {
      const createResult = await signIn.create({ identifier: email.trim() });
      const createErr = getClerkCallError(createResult);
      if (createErr) {
        setFormError(createErr);
        return;
      }

      const pwResult = await signIn.password({ password });
      const pwErr = getClerkCallError(pwResult);
      if (pwErr) {
        setFormError(pwErr);
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: async () => router.replace("/(tabs)"),
        });
      } else {
        setFormError("Additional verification is required for this account.");
      }
    } catch (err: any) {
      setFormError(
        err?.errors?.[0]?.longMessage ?? err?.message ?? "Sign in failed.",
      );
    }
  };

  const verifyEmailCode = async () => {
    setSuppressClerkErrors(false);
    setFormError(null);
    try {
      await signIn.emailCode.verifyCode({ code: code.trim() });

      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: async () => router.replace("/(tabs)"),
        });
      } else {
        setFormError("Code verification is not complete yet.");
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

    if (mode === "password") {
      if (!password.trim()) {
        setClientIssue("signin_password_required");
        return;
      }
      if (password.length < 8) {
        return;
      }
      await signInWithPassword();
      return;
    }

    if (step === "form") {
      await startEmailCodeFlow();
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

    await verifyEmailCode();
  };

  const onSwitchMode = (next: Mode) => {
    setMode(next);
    setFormError(null);
    setClientIssue(null);
    setSuppressClerkErrors(false);
    setStep("form");
    setPassword("");
    setCode("");
    void signIn.reset();
  };

  const primaryLabel =
    mode === "password"
      ? "Sign In"
      : step === "form"
        ? "Send code"
        : "Verify code";

  const authMessages = uniqueAuthMessages([
    ...(suppressClerkErrors
      ? []
      : [
          errors?.fields?.identifier?.message,
          errors?.fields?.password?.message,
          errors?.fields?.code?.message,
        ]),
    formError,
    clientIssue ? AUTH_CLIENT_ISSUE_MESSAGES[clientIssue] : null,
  ]);

  return (
    <AuthShell title="Welcome back" subtitle={subtitle}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="auth-form">
          <View className="picker-row">
            <TouchableOpacity
              className={
                mode === "password"
                  ? "picker-option picker-option-active"
                  : "picker-option"
              }
              onPress={() => onSwitchMode("password")}
              disabled={submitting}
            >
              <Text
                className={
                  mode === "password"
                    ? "picker-option-text picker-option-text-active"
                    : "picker-option-text"
                }
              >
                Password
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={
                mode === "email_code"
                  ? "picker-option picker-option-active"
                  : "picker-option"
              }
              onPress={() => onSwitchMode("email_code")}
              disabled={submitting}
            >
              <Text
                className={
                  mode === "email_code"
                    ? "picker-option-text picker-option-text-active"
                    : "picker-option-text"
                }
              >
                Email code
              </Text>
            </TouchableOpacity>
          </View>

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
              returnKeyType={mode === "password" ? "next" : "done"}
            />
            {emailInvalid ? (
              <Text className="auth-error">
                Enter a valid email address (e.g. name@example.com).
              </Text>
            ) : null}
          </View>

          {mode === "password" ? (
            <View className="auth-field">
              <Text className="auth-label">Password</Text>
              <TextInput
                className="auth-input"
                secureTextEntry
                placeholder="••••••••"
                placeholderTextColor="rgba(0,0,0,0.35)"
                value={password}
                editable={!submitting}
                onChangeText={(value) => {
                  setPassword(value);
                  setSuppressClerkErrors(true);
                  setFormError(null);
                  setClientIssue((issue) =>
                    issue === "signin_password_required" && value.trim()
                      ? null
                      : issue,
                  );
                }}
                returnKeyType="done"
              />
              {passwordTooShort ? (
                <Text className="auth-error">
                  Password must be at least 8 characters.
                </Text>
              ) : null}
            </View>
          ) : null}

          {mode === "email_code" && step === "code" ? (
            <View className="auth-field">
              <Text className="auth-label">Code</Text>
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
                onPress={() => {
                  setStep("form");
                  setCode("");
                  setFormError(null);
                  setClientIssue(null);
                  setSuppressClerkErrors(true);
                }}
                disabled={submitting}
              >
                <Text className="auth-secondary-button-text">
                  Use a different email
                </Text>
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

          <View className="auth-divider-row">
            <View className="auth-divider-line" />
            <Text className="auth-divider-text">or</Text>
            <View className="auth-divider-line" />
          </View>

          <View className="auth-link-row">
            <Text className="auth-link-copy">New here?</Text>
            <Link href="/(auth)/sign-up" className="auth-link">
              Create an account
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </AuthShell>
  );
}
