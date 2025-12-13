import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import "../global.css";

export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: "horizontal",
          fullScreenGestureEnabled: true,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="task/create"
          options={{
            headerShown: false,
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="task/[id]"
          options={{
            headerShown: false,
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="user"
          options={{
            headerShown: false,
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
          }}
        />
      </Stack>
      <PortalHost />
    </>
  );
}
