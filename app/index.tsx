import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Button className="w-10 bg-red-400">
        <Text className="text-blue-500">aaaaaa</Text>
      </Button>
      <Text>ss</Text>
      <Text style={{ marginTop: 12 }}>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
