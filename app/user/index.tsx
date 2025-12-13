import { View } from "react-native";
import { Text } from "@/components/ui/text";
import BackHeader from "@/components/BackHeader";
import { useColorScheme } from "nativewind";

export default function UserScreen() {
  const { colorScheme } = useColorScheme();

  return (
    <View className="flex-1 bg-white dark:bg-black px-6 pt-6">
      <BackHeader />
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold dark:text-white">User page</Text>
        <Text className="mt-2 text-base text-black/60 dark:text-white/60 text-center">
          Placeholder screen to preview the highlighted user tab icon.
        </Text>
        <View
          className="mt-6 h-24 w-24 rounded-full items-center justify-center"
          style={{
            backgroundColor:
              colorScheme === "dark"
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.05)",
          }}
        >
          <Text className="text-sm text-black/50 dark:text-white/70">
            Empty state
          </Text>
        </View>
      </View>
    </View>
  );
}
