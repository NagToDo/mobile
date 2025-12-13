import { View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import Feather from "@expo/vector-icons/Feather";
import { Text } from "@/components/ui/text";

interface BackHeaderProps {
  title?: string;
}

export default function BackHeader({ title }: BackHeaderProps) {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === "dark" ? "#fff" : "#000";

  return (
    <View className="flex-row items-center gap-3 pb-2">
      <Pressable
        onPress={() => router.back()}
        hitSlop={12}
        className="h-10 w-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10"
      >
        <Feather name="arrow-left" size={20} color={iconColor} />
      </Pressable>
      {title && (
        <Text className="text-lg font-semibold dark:text-white">{title}</Text>
      )}
    </View>
  );
}
