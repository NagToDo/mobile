import { View } from "react-native";
import { Text } from "@/components/ui/text";

export default function AddTask() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-semibold">Add a new task</Text>
    </View>
  );
}
