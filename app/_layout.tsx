import { Stack } from "expo-router";
import { PortalHost } from "@rn-primitives/portal";
import "../global.css";

export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen />
      </Stack>
      <PortalHost />
    </>
  );
}
