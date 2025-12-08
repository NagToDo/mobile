import { View, Pressable } from "react-native";
import { Tabs } from "expo-router";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Entypo from "@expo/vector-icons/Entypo";
import { PortalHost } from "@rn-primitives/portal";
import "../global.css";
import { Text } from "@/components/ui/text";
import { useColorScheme } from "nativewind";

function CustomTabBar({ navigation, state }: BottomTabBarProps) {
  const { colorScheme } = useColorScheme();

  const goTo = (routeName: string) => {
    navigation.navigate(routeName);
  };

  const isFocused = (routeName: string) =>
    state.routes[state.index]?.name === routeName;

  const inactiveColor =
    colorScheme === "dark" ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.6)";
  const activeColor = colorScheme === "dark" ? "#fff" : "#000";

  return (
    <View className="bg-white dark:bg-neutral-900 border-t border-black/10 dark:border-white/10">
      <View className="relative flex-row items-center justify-between px-10 py-4">
        <Pressable
          className="absolute left-1/2 -top-6 h-14 w-14 rounded-full items-center justify-center bg-white dark:bg-neutral-800 shadow-lg border-2 border-black/40 dark:border-white/30"
          onPress={() => goTo("task/create")}
          hitSlop={8}
          style={{ opacity: isFocused("add") ? 1 : 0.65 }}
        >
          <Entypo
            name="plus"
            size={24}
            color={isFocused("add") ? activeColor : inactiveColor}
          />
        </Pressable>

        <Pressable
          className="flex-1 items-center"
          onPress={() => goTo("index")}
          hitSlop={8}
          style={{ opacity: isFocused("index") ? 1 : 0.5 }}
        >
          <Entypo
            name="home"
            size={22}
            color={isFocused("index") ? activeColor : inactiveColor}
          />
          <Text
            className="text-xs mt-1"
            style={{ color: isFocused("index") ? activeColor : inactiveColor }}
          >
            Home
          </Text>
        </Pressable>

        <Pressable
          className="flex-1 items-center"
          onPress={() => goTo("task/create")}
          hitSlop={8}
          style={{ opacity: isFocused("add") ? 1 : 0.5 }}
        >
          <Entypo
            name="list"
            size={22}
            color={isFocused("add") ? activeColor : inactiveColor}
          />
          <Text
            className="text-xs mt-1"
            style={{ color: isFocused("add") ? activeColor : inactiveColor }}
          >
            Tasks
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
        }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="task/create" options={{ title: "Add Task" }} />
      </Tabs>
      <PortalHost />
    </>
  );
}
