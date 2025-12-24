import supabase from "@/api/client";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ThemeSelector } from "@/components/ThemeSelector";
import type { Session } from "@supabase/supabase-js";
import { useRouter } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import { ScrollView, View } from "react-native";
import { useEffect, useState } from "react";
import { useThemeColors } from "@/lib/colors";

export default function UserScreen() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const colors = useThemeColors();

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session ?? null);
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace("/auth");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <ScrollView
        className="flex-1 px-6 pt-6"
        contentContainerClassName="pb-24"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-bold dark:text-white">Settings</Text>
          <Text className="text-sm text-black/40 dark:text-white/40">
            v1.0.0
          </Text>
        </View>

        {/* Profile Section */}
        <View className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-black/5 dark:border-white/10">
          <View className="flex-row items-center gap-4">
            <View
              className="h-14 w-14 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.muted }}
            >
              <Feather name="user" size={24} color={colors.foreground} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold dark:text-white">
                {session?.user.email?.split("@")[0] || "User"}
              </Text>
              <Text className="text-sm text-black/60 dark:text-white/60">
                {session?.user.email || "Loading..."}
              </Text>
            </View>
          </View>
        </View>

        {/* Theme Settings Section */}
        <View className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-black/5 dark:border-white/10 mt-4">
          <ThemeSelector />
        </View>

        {/* Account Section */}
        <View className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-black/5 dark:border-white/10 mt-4">
          <View className="flex-row items-center gap-3 mb-4">
            <Feather name="settings" size={20} color={colors.foreground} />
            <Text className="text-lg font-semibold dark:text-white">
              Account
            </Text>
          </View>

          <Button
            variant="outline"
            className="w-full mb-3"
            onPress={handleLogout}
          >
            <Feather name="log-out" size={16} color={colors.foreground} />
            <Text className="font-semibold">Sign out</Text>
          </Button>

          <Button
            className="w-full"
            style={{ backgroundColor: "#b91c1c" }}
            onPress={() => {}}
          >
            <Text className="font-semibold" style={{ color: "#ffffff" }}>
              Delete account
            </Text>
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
