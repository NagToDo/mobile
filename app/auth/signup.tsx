import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  TextInput,
  View,
  Pressable,
} from "react-native";
import { Redirect, useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { useColorScheme } from "nativewind";
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import type { Session } from "@supabase/supabase-js";

import supabase, { supabaseConfigured } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

export default function SignupScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  const placeholderColor = colorScheme === "dark" ? "#9ca3af" : "#9ca3af";

  useEffect(() => {
    let isMounted = true;

    if (!supabaseConfigured) {
      setSessionLoading(false);
      return () => {
        isMounted = false;
      };
    }

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!isMounted) return;
        setSession(data.session ?? null);
      })
      .finally(() => {
        if (!isMounted) return;
        setSessionLoading(false);
      });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!isMounted) return;
        setSession(nextSession);
      },
    );

    return () => {
      isMounted = false;
      subscription?.subscription.unsubscribe();
    };
  }, []);

  const handleEmailSignup = async () => {
    if (!supabaseConfigured) {
      setError(
        "Supabase credentials are not configured. Add EXPO_PUBLIC_API_URL and EXPO_PUBLIC_API_KEY.",
      );
      return;
    }

    setError(null);
    setStatus(null);

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) throw signUpError;
      setStatus("Account created. Check your email to confirm.");
    } catch (authError) {
      const message =
        authError instanceof Error
          ? authError.message
          : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (!supabaseConfigured) {
      setError(
        "Supabase credentials are not configured. Add EXPO_PUBLIC_API_URL and EXPO_PUBLIC_API_KEY.",
      );
      return;
    }

    setError(null);
    setStatus(null);
    setGoogleLoading(true);

    try {
      const redirectTo = Linking.createURL("/");
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (oauthError) throw oauthError;

      if (data?.url) {
        await Linking.openURL(data.url);
        setStatus("Opening Google sign-in...");
      } else {
        setStatus("Continue in the browser to finish Google sign-in.");
      }
    } catch (authError) {
      const message =
        authError instanceof Error
          ? authError.message
          : "Google sign-in failed. Please try again.";
      setError(message);
    } finally {
      setGoogleLoading(false);
    }
  };

  if (!sessionLoading && session) {
    return <Redirect href="/" />;
  }

  if (!supabaseConfigured) {
    return (
      <ScrollView
        className="flex-1 bg-white dark:bg-black"
        contentContainerClassName="p-6 pb-12 gap-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-3">
          <Text className="text-3xl font-bold dark:text-white">
            Auth is not configured
          </Text>
          <Text className="text-base text-black/60 dark:text-white/60">
            Set EXPO_PUBLIC_API_URL and EXPO_PUBLIC_API_KEY to enable Supabase
            authentication.
          </Text>
        </View>
        <Button
          className="h-12 rounded-xl bg-black dark:bg-white"
          onPress={() => router.replace("/")}
        >
          <Text className="text-base font-semibold text-white dark:text-black">
            Go back to tasks
          </Text>
        </Button>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-black"
      contentContainerClassName="flex-grow p-6 pb-12 pt-12 gap-10"
      showsVerticalScrollIndicator={false}
    >
      <View className="gap-3 items-center">
        <Text className="text-4xl font-extrabold text-center dark:text-white">
          Create your account
        </Text>
        <Text className="text-base text-center text-black/60 dark:text-white/60">
          Sign up to sync your tasks and stay organized.
        </Text>
      </View>

      <View className="gap-6 self-stretch">
        <View className="gap-4">
          <View className="gap-2">
            <Text className="text-sm font-semibold text-black dark:text-white">
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={placeholderColor}
              className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900 px-4 py-3 text-base dark:text-white"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-black dark:text-white">
              Password
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={placeholderColor}
              className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900 px-4 py-3 text-base dark:text-white"
              secureTextEntry
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-black dark:text-white">
              Confirm password
            </Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repeat password"
              placeholderTextColor={placeholderColor}
              className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900 px-4 py-3 text-base dark:text-white"
              secureTextEntry
            />
          </View>

          <View className="gap-2">
            <Button
              className="h-12 rounded-xl bg-black dark:bg-white"
              onPress={handleEmailSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator
                  color={colorScheme === "dark" ? "#000" : "#fff"}
                />
              ) : (
                <Text className="text-base font-semibold text-white dark:text-black">
                  Create account
                </Text>
              )}
            </Button>
            <Pressable onPress={() => router.push("/auth")}>
              <Text className="text-center text-sm text-black/60 dark:text-white/60">
                Already have an account? Log in
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View className="flex-row items-center justify-center gap-2 self-stretch">
        <View className="flex-1 h-px bg-black/10 dark:bg-white/20" />
        <Text className="text-xs text-black/50 dark:text-white/60">OR</Text>
        <View className="flex-1 h-px bg-black/10 dark:bg-white/20" />
      </View>

      <View className="gap-3 self-stretch">
        <Button
          variant="outline"
          className="h-12 rounded-xl border border-black/10 dark:border-white/20 bg-white dark:bg-neutral-900 flex-row items-center justify-center gap-3"
          onPress={handleGoogleAuth}
          disabled={googleLoading}
        >
          {googleLoading ? (
            <ActivityIndicator />
          ) : (
            <>
              <AntDesign
                name="google"
                size={18}
                color={colorScheme === "dark" ? "#fff" : "#000"}
              />
              <Text className="text-base font-semibold text-black dark:text-white">
                Continue with Google
              </Text>
            </>
          )}
        </Button>
      </View>

      {(error || status) && (
        <View
          className={`rounded-xl border px-4 py-3 ${
            error
              ? "border-red-200 bg-red-50 dark:border-red-400/40 dark:bg-red-900/40"
              : "border-green-200 bg-green-50 dark:border-green-400/40 dark:bg-green-900/30"
          }`}
        >
          <View className="flex-row items-start gap-3">
            <Entypo
              name={error ? "cross" : "check"}
              size={18}
              color={error ? "#ef4444" : "#22c55e"}
            />
            <Text
              className={`flex-1 text-sm ${
                error
                  ? "text-red-600 dark:text-red-200"
                  : "text-green-700 dark:text-green-100"
              }`}
            >
              {error ?? status}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
