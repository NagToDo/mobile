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
    <Button
      variant="outline"
      className="flex-row w-full min-h-24 items-center gap-4 rounded-2xl border border-black/15 bg-white px-4 py-4 shadow-md shadow-black/10"
    >
      <Checkbox
        className="w-7 h-7 rounded-full border-2 border-neutral-300 bg-white"
        checkedClassName="bg-white"
        indicatorClassName={cn(
          "rounded-full bg-black transition-all duration-200 ease-out",
          checked ? "scale-90 opacity-100" : "scale-0 opacity-0",
        )}
        iconClassName="text-white"
        checked={checked}
        onCheckedChange={setChecked}
      />
      <View className="flex-col justify-start flex-1">
        <Text className="text-lg font-semibold text-black">{title}</Text>
        <Text className="text-sm text-black/70 mt-1">{description}</Text>
      </View>
      {/* <View className="rounded-full w-4 h-4 bg-red-500" /> */}
    </Button>
  );
}
