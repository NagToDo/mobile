import { ThemeSelector } from "@/components/ThemeSelector";
import { Text } from "@/components/ui/text";
import { ScrollView, View } from "react-native";

export default function UserScreen() {
  return (
    <View className="flex-1 bg-white dark:bg-black">
      <ScrollView
        className="flex-1 px-6 pt-6"
        contentContainerClassName="pb-24"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold dark:text-white mb-6">
          Settings
        </Text>

        {/* Theme Settings Section */}
        <View className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-black/5 dark:border-white/10">
          <Text className="text-lg font-semibold dark:text-white mb-4">
            Theme
          </Text>
          <ThemeSelector />
        </View>

        {/* Placeholder for future settings */}
        <View className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-black/5 dark:border-white/10 mt-4">
          <Text className="text-lg font-semibold dark:text-white mb-2">
            Account
          </Text>
          <Text className="text-sm text-black/60 dark:text-white/60">
            Account settings coming soon...
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
