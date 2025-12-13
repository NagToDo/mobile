import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

export default function TaskCardSkeleton() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <View className="flex-row w-full min-h-28 items-center gap-4 rounded-2xl border border-black/15 dark:border-white/15 bg-white dark:bg-neutral-900 px-4 py-4 shadow-md shadow-black/10 dark:shadow-black/30">
      {/* Checkbox skeleton */}
      <Animated.View
        style={{ opacity }}
        className="w-7 h-7 rounded-full border-2 border-neutral-300 dark:border-neutral-600 bg-white dark:bg-black"
      />

      {/* Text content skeleton */}
      <View className="flex-col justify-start flex-1 gap-2">
        <View>
          {/* Title skeleton */}
          <Animated.View
            style={{ opacity }}
            className="h-[22px] w-3/4 rounded-md bg-neutral-200 dark:bg-neutral-700"
          />
          {/* Description skeleton */}
          <Animated.View
            style={{ opacity }}
            className="h-4 w-full rounded-md bg-neutral-200 dark:bg-neutral-700 mt-1"
          />
        </View>
        {/* Meta info skeleton (time, frequency, interval) */}
        <View className="flex-row items-center gap-4">
          <Animated.View
            style={{ opacity }}
            className="h-3 w-16 rounded-md bg-neutral-200 dark:bg-neutral-700"
          />
          <Animated.View
            style={{ opacity }}
            className="h-3 w-14 rounded-md bg-neutral-200 dark:bg-neutral-700"
          />
          <Animated.View
            style={{ opacity }}
            className="h-3 w-20 rounded-md bg-neutral-200 dark:bg-neutral-700"
          />
        </View>
      </View>
    </View>
  );
}
