import { View, Pressable } from "react-native";
import { Tabs } from "expo-router";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Entypo from "@expo/vector-icons/Entypo";
import { PortalHost } from "@rn-primitives/portal";
import "../global.css";
import { Text } from "@/components/ui/text";

function CustomTabBar({ navigation, state }: BottomTabBarProps) {
  const goTo = (routeName: string) => {
    navigation.navigate(routeName);
  };

  const isFocused = (routeName: string) =>
    state.routes[state.index]?.name === routeName;

  return (
    <View className="bg-white border-t border-black/10">
      <View className="relative flex-row items-center justify-between px-10 py-4">
        <Pressable
          className="absolute left-1/2 -top-6 h-14 w-14 rounded-full items-center justify-center bg-white shadow-lg border-2 border-black/40"
          onPress={() => goTo("add")}
          hitSlop={8}
          style={{ opacity: isFocused("add") ? 1 : 0.65 }}
        >
          <Entypo name="plus" size={24} />
        </Pressable>

        <Pressable
          className="flex-1 items-center"
          onPress={() => goTo("index")}
          hitSlop={8}
          style={{ opacity: isFocused("index") ? 1 : 0.5 }}
        >
          <Entypo name="home" size={22} />
          <Text className="text-xs mt-1">Home</Text>
        </Pressable>

        <Pressable
          className="flex-1 items-center"
          onPress={() => goTo("add")}
          hitSlop={8}
          style={{ opacity: isFocused("add") ? 1 : 0.5 }}
        >
          <Entypo name="list" size={22} />
          <Text className="text-xs mt-1">Tasks</Text>
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
        <Tabs.Screen name="add" options={{ title: "Add Task" }} />
      </Tabs>
      <PortalHost />
    </>
  );
}
