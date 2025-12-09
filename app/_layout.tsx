import { View, Pressable } from "react-native";
import { Tabs, usePathname, useRouter, type Href } from "expo-router";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import { PortalHost } from "@rn-primitives/portal";
import "../global.css";
import { Text } from "@/components/ui/text";
import { useColorScheme } from "nativewind";

type TabRoute = "index" | "task/create" | "user";

function CustomTabBar({ state }: BottomTabBarProps) {
  const { colorScheme } = useColorScheme();
  const pathname = usePathname();
  const router = useRouter();

  const hideTabBar = pathname?.startsWith("/auth");

  if (hideTabBar) {
    return null;
  }

  const routeToPath: Record<TabRoute, Href> = {
    index: "/",
    "task/create": "/task/create",
    user: "/user",
  };

  const isFocusedPath = (routeName: TabRoute) => {
    const path = routeToPath[routeName];
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  const goTo = (routeName: TabRoute) => {
    router.navigate(routeToPath[routeName]);
  };

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
            onPress={() => goTo("task/create")}
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
            onPress={() => goTo("index")}
            hitSlop={8}
            style={{
              opacity: isFocused("index") || isFocusedPath("index") ? 1 : 0.6,
            }}
          >
            <Entypo
              name="home"
              size={22}
              color={
                isFocused("index") || isFocusedPath("index")
                  ? activeColor
                  : inactiveColor
              }
            />
            <Text
              className="text-xs mt-1"
              style={{
                color:
                  isFocused("index") || isFocusedPath("index")
                    ? activeColor
                    : inactiveColor,
              }}
            >
              Home
            </Text>
          </Pressable>

          <View className="w-16" />

          <Pressable
            className="flex-1 items-center"
            onPress={() => goTo("user")}
            hitSlop={8}
            style={{
              opacity: isFocused("user") || isFocusedPath("user") ? 1 : 0.6,
            }}
          >
            <Feather
              name="user"
              size={24}
              color={
                isFocused("user") || isFocusedPath("user")
                  ? activeColor
                  : inactiveColor
              }
            />
            <Text
              className="text-xs mt-1"
              style={{
                color:
                  isFocused("user") || isFocusedPath("user")
                    ? activeColor
                    : inactiveColor,
              }}
            >
              User
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <>
      <Tabs
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
        }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="task/create" options={{ title: "Add Task" }} />
        <Tabs.Screen name="user/index" options={{ title: "User" }} />
      </Tabs>
      <PortalHost />
    </>
  );
}
