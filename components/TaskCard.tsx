import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { View } from "react-native";
import { Checkbox } from "./ui/checkbox";
import { useState } from "react";

interface TaskCardProps {
  title: string;
  description: string;
}

export default function TaskCard({ title, description }: TaskCardProps) {
  const [checked, setChecked] = useState(false);

  return (
    <Button className="flex shadow-md w-full min-h-24 gap-5">
      <Checkbox
        className="w-7 h-7 rounded-full border-2 border-neutral-400"
        checkedClassName="bg-white"
        indicatorClassName={cn(
          "rounded-full bg-white transition-all duration-200 ease-out",
          checked ? "scale-90 opacity-100" : "scale-0 opacity-0",
        )}
        iconClassName="text-black"
        checked={checked}
        onCheckedChange={setChecked}
      />
      <View className="flex-col justify-start flex-1">
        <Text className="text-lg font-bold">{title}</Text>
        <Text className="opacity-80">{description}</Text>
      </View>
      {/* <View className="rounded-full w-4 h-4 bg-red-500" /> */}
    </Button>
  );
}
