import { useColorScheme, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import Entypo from "@expo/vector-icons/Entypo";
import TaskCard from "@/components/TaskCard";

export default function Index() {
  return (
    <View className="p-6 flex-1 items-center justify-center">
      <TaskCard title="Task 1" description="Description 1" />
      <TaskCard title="Task 2" description="Description 2" />
      <TaskCard title="Task 3" description="Description 3" />

      <Text className="mt-4">Edit app/index.tsx to edit this screen.</Text>
      <Button className="absolute bottom-6 right-6 w-14 h-14 flex items-center justify-center p-0">
        <Entypo name="plus" size={30} color="white" />
      </Button>
    </View>
  );
}
