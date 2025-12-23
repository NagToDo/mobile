import supabase from "@/api/client";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/lib/colors";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import type { Session } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import { Redirect, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import ToastManager, { Toast } from "toastify-react-native";

export default function AuthScreen() {
  const router = useRouter();
  const { colorScheme, toggleColorScheme, input, icon, primary } =
    useThemeColors();

  const [email, setEmail] = useState("cabibbonehuen@gmail.com");
  const [password, setPassword] = useState("AAAAAAAA");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

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

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Toast.error(
        "Email and password are required.",
        "top",
        undefined,
        undefined,
        true,
      );
      return;
    }

    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      Toast.success(
        "Signed in! Redirecting...",
        "top",
        undefined,
        undefined,
        true,
      );
      router.replace("/");
    } catch (authError) {
      const message =
        authError instanceof Error
          ? authError.message
          : "Something went wrong. Please try again.";
      Toast.error(message, "top", undefined, undefined, true);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
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
        Toast.success(
          "Opening Google sign-in...",
          "top",
          undefined,
          undefined,
          true,
        );
      }
    } catch (authError) {
      const message =
        authError instanceof Error
          ? authError.message
          : "Google sign-in failed. Please try again.";
      Toast.error(message, "top", undefined, undefined, true);
    } finally {
      setGoogleLoading(false);
    }
  };

  if (!sessionLoading && session) {
    return <Redirect href="/" />;
  }

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-black"
      contentContainerClassName="flex-grow p-6 pb-12 pt-6 gap-8"
      showsVerticalScrollIndicator={false}
    >
      <ToastManager position="top" theme="light" />
      <View className="flex-row items-center justify-end">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full border border-black/15 dark:border-white/20 bg-white dark:bg-neutral-900"
          onPress={toggleColorScheme}
        >
          <Feather
            name={colorScheme === "dark" ? "sun" : "moon"}
            size={16}
            color={icon.default}
          />
        </Button>
      </View>
      <View className="gap-3 items-center">
        <Text className="text-4xl font-extrabold text-center dark:text-white">
          Welcome back
        </Text>
        <Text className="text-base text-center text-black/60 dark:text-white/60">
          Sign in to keep track of your tasks across devices.
        </Text>
      </View>

      <View className="gap-6 self-stretch">
        <View className="gap-4">
          <View className="gap-2">
            <Text className="text-sm font-semibold text-black dark:text-white">
              Email
            </Text>
            <TextInput
              key={`email-${colorScheme}`}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={input.placeholder}
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
              key={`password-${colorScheme}`}
              value={password}
              onChangeText={setPassword}
              placeholder="********"
              placeholderTextColor={input.placeholder}
              className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900 px-4 py-3 text-base dark:text-white"
              secureTextEntry
            />
          </View>

          <View className="gap-2">
            <Button
              className="h-12 rounded-xl bg-black dark:bg-white"
              onPress={handleEmailAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={primary} />
              ) : (
                <Text className="text-base font-semibold text-white dark:text-black">
                  Login with email
                </Text>
              )}
            </Button>
            <Pressable onPress={() => router.push("/auth/signup" as const)}>
              <Text className="text-center text-sm text-black/60 dark:text-white/60">
                Don't have an account?{" "}
                <Text className="font-semibold text-black dark:text-white">
                  Sign up
                </Text>
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View className="gap-3 self-stretch -mt-2">
        <View className="flex-row items-center justify-center gap-2">
          <View className="flex-1 h-px bg-black/10 dark:bg-white/20" />
          <Text className="text-xs text-black/50 dark:text-white/60">OR</Text>
          <View className="flex-1 h-px bg-black/10 dark:bg-white/20" />
        </View>

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
              <AntDesign name="google" size={18} color={icon.default} />
              <Text className="text-base font-semibold text-black dark:text-white">
                Continue with Google
              </Text>
            </>
          )}
        </Button>
      </View>
    </ScrollView>
  );
}
