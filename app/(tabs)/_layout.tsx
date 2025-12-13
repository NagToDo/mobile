import { Text } from "@/components/ui/text";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { Pressable, View } from "react-native";
import "../../global.css";

function CustomTabBar({ state }: BottomTabBarProps) {
  const { colorScheme } = useColorScheme();
  const router = useRouter();

  const isFocused = (routeName: string) =>
    state.routes[state.index]?.name === routeName;

  const inactiveColor =
    colorScheme === "dark" ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.6)";
  const activeColor = colorScheme === "dark" ? "#fff" : "#000";
  const fabBackground = colorScheme === "dark" ? "#f8fafc" : "#0f172a";
  const fabIconColor = colorScheme === "dark" ? "#0f172a" : "#f8fafc";
  const fabBorderColor =
    colorScheme === "dark" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.25)";

  return (
    <View className="bg-white dark:bg-neutral-900 border-t border-black/10 dark:border-white/10">
      <View className="relative">
        <View className="absolute left-1/2 -top-8 -translate-x-1/2">
          <Pressable
            className="h-16 w-16 rounded-full items-center justify-center shadow-lg shadow-black/20 dark:shadow-black/40"
            onPress={() => router.push("/task/create")}
            hitSlop={8}
            style={{
              backgroundColor: fabBackground,
              borderColor: fabBorderColor,
              borderWidth: 2,
            }}
          >
            <Entypo name="plus" size={26} color={fabIconColor} />
          </Pressable>
        </View>

        <View className="flex-row items-center justify-between px-12 py-5">
          <Pressable
            className="flex-1 items-center"
            onPress={() => router.navigate("/")}
            hitSlop={8}
            style={{
              opacity: isFocused("index") ? 1 : 0.6,
            }}
          >
            <Entypo
              name="home"
              size={22}
              color={isFocused("index") ? activeColor : inactiveColor}
            />
            <Text
              className="text-xs mt-1"
              style={{
                color: isFocused("index") ? activeColor : inactiveColor,
              }}
            >
              Home
            </Text>
          </Pressable>

          <View className="w-16" />

          <Pressable
            className="flex-1 items-center"
            onPress={() => router.navigate("/(tabs)/stats" as any)}
            hitSlop={8}
            style={{
              opacity: isFocused("stats") ? 1 : 0.6,
            }}
          >
            <Feather
              name="bar-chart-2"
              size={22}
              color={isFocused("stats") ? activeColor : inactiveColor}
            />
            <Text
              className="text-xs mt-1"
              style={{
                color: isFocused("stats") ? activeColor : inactiveColor,
              }}
            >
              Stats
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="stats" options={{ title: "Stats" }} />
    </Tabs>
  );
}
