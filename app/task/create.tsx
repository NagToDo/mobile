import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { useTasks } from "@/hooks/useTasks";
import { Frequency } from "@/domain/models/Task";
import { notificationService } from "@/services/notification";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { PortalHost } from "@rn-primitives/portal";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { Calendar } from "react-native-calendars";
import DatePicker from "react-native-date-picker";
import ToastManager, { Toast } from "toastify-react-native";

// const MAX_CATEGORIES = 3;

/* const iconOptions = [
  { label: "smile", value: "smile" },
  { label: "heart", value: "heart" },
  { label: "star", value: "star" },
  { label: "sun", value: "sun" },
  { label: "moon", value: "moon" },
  { label: "coffee", value: "coffee" },
  { label: "book", value: "book" },
  { label: "activity", value: "activity" },
  { label: "briefcase", value: "briefcase" },
  { label: "home", value: "home" },
  { label: "check", value: "check" },
  { label: "check-circle", value: "check-circle" },
  { label: "clock", value: "clock" },
  { label: "bell", value: "bell" },
  { label: "calendar", value: "calendar" },
  { label: "music", value: "music" },
  { label: "target", value: "target" },
  { label: "zap", value: "zap" },
  { label: "map-pin", value: "map-pin" },
  { label: "package", value: "package" },
  { label: "tool", value: "tool" },
  { label: "umbrella", value: "umbrella" },
  { label: "camera", value: "camera" },
  { label: "feather", value: "feather" },
  { label: "flag", value: "flag" },
  { label: "gift", value: "gift" },
  { label: "globe", value: "globe" },
  { label: "layers", value: "layers" },
  { label: "list", value: "list" },
  { label: "shopping-bag", value: "shopping-bag" },
  { label: "shopping-cart", value: "shopping-cart" },
  { label: "shield", value: "shield" },
  { label: "truck", value: "truck" },
  { label: "cpu", value: "cpu" },
  { label: "database", value: "database" },
  { label: "cloud", value: "cloud" },
  { label: "cloud-rain", value: "cloud-rain" },
  { label: "cloud-snow", value: "cloud-snow" },
  { label: "droplet", value: "droplet" },
  { label: "edit", value: "edit" },
  { label: "edit-2", value: "edit-2" },
  { label: "edit-3", value: "edit-3" },
  { label: "external-link", value: "external-link" },
  { label: "eye", value: "eye" },
  { label: "eye-off", value: "eye-off" },
  { label: "file", value: "file" },
  { label: "file-text", value: "file-text" },
  { label: "folder", value: "folder" },
  { label: "folder-plus", value: "folder-plus" },
  { label: "folder-minus", value: "folder-minus" },
  { label: "film", value: "film" },
  { label: "filter", value: "filter" },
  { label: "git-branch", value: "git-branch" },
  { label: "git-commit", value: "git-commit" },
  { label: "git-pull-request", value: "git-pull-request" },
  { label: "github", value: "github" },
  { label: "gitlab", value: "gitlab" },
  { label: "grid", value: "grid" },
  { label: "headphones", value: "headphones" },
  { label: "help-circle", value: "help-circle" },
  { label: "info", value: "info" },
  { label: "link", value: "link" },
  { label: "lock", value: "lock" },
  { label: "log-out", value: "log-out" },
  { label: "mail", value: "mail" },
  { label: "map", value: "map" },
  { label: "message-circle", value: "message-circle" },
  { label: "message-square", value: "message-square" },
  { label: "mic", value: "mic" },
  { label: "minus", value: "minus" },
  { label: "navigation", value: "navigation" },
  { label: "paperclip", value: "paperclip" },
  { label: "pen-tool", value: "pen-tool" },
  { label: "percent", value: "percent" },
  { label: "phone", value: "phone" },
  { label: "pie-chart", value: "pie-chart" },
  { label: "play", value: "play" },
  { label: "plus", value: "plus" },
  { label: "pocket", value: "pocket" },
  { label: "printer", value: "printer" },
  { label: "radio", value: "radio" },
  { label: "refresh-cw", value: "refresh-cw" },
  { label: "repeat", value: "repeat" },
  { label: "rewind", value: "rewind" },
  { label: "rss", value: "rss" },
  { label: "save", value: "save" },
  { label: "scissors", value: "scissors" },
  { label: "search", value: "search" },
  { label: "send", value: "send" },
  { label: "server", value: "server" },
  { label: "settings", value: "settings" },
  { label: "share", value: "share" },
  { label: "share-2", value: "share-2" },
  { label: "shuffle", value: "shuffle" },
  { label: "skip-back", value: "skip-back" },
  { label: "skip-forward", value: "skip-forward" },
  { label: "sliders", value: "sliders" },
  { label: "smartphone", value: "smartphone" },
  { label: "speaker", value: "speaker" },
  { label: "square", value: "square" },
  { label: "stop-circle", value: "stop-circle" },
  { label: "sunrise", value: "sunrise" },
  { label: "sunset", value: "sunset" },
  { label: "tag", value: "tag" },
  { label: "thermometer", value: "thermometer" },
  { label: "thumbs-up", value: "thumbs-up" },
  { label: "thumbs-down", value: "thumbs-down" },
  { label: "trash", value: "trash" },
  { label: "trending-up", value: "trending-up" },
  { label: "tv", value: "tv" },
  { label: "type", value: "type" },
  { label: "unlock", value: "unlock" },
  { label: "video", value: "video" },
  { label: "volume", value: "volume" },
  { label: "watch", value: "watch" },
  { label: "wifi", value: "wifi" },
  { label: "wind", value: "wind" },
  { label: "x-circle", value: "x-circle" },
]; */

export default function CreateTask() {
  const { colorScheme } = useColorScheme();
  const { width: windowWidth } = useWindowDimensions();
  const iconColor = colorScheme === "dark" ? "#fff" : "#000";
  const router = useRouter();
  const { createTask } = useTasks();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // const [categories, setCategories] = useState<
  //   { name: string; icon: string }[]
  // >([]);
  const [notificationTime, setNotificationTime] = useState("Set time");
  const [notificationType, setNotificationType] = useState("Notification type");
  const [alarmModalVisible, setAlarmModalVisible] = useState(false);
  const [alarmFrequency, setAlarmFrequency] = useState<number | null>(1);
  // const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  // const [emojiSearch, setEmojiSearch] = useState("");
  // const [categoryStep, setCategoryStep] = useState<1 | 2>(1);
  // const [draftCategoryName, setDraftCategoryName] = useState("");
  // const [draftIcon, setDraftIcon] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [descriptionError, setDescriptionError] = useState(false);
  const [alarmError, setAlarmError] = useState(false);
  const [dateError, setDateError] = useState(false);

  // Date modal state
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [frequency, setFrequency] = useState<string>("single");
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const todayString = (() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  })();
  const [selectedTime, setSelectedTime] = useState<Date>(() => {
    const now = new Date();
    now.setSeconds(0, 0);
    return now;
  });
  const [timePickerOpen, setTimePickerOpen] = useState(false);

  const frequencyOptions = [
    { value: "daily", label: "Repeat daily" },
    { value: "single", label: "Single Day" },
    { value: "weekly", label: "Every Week" },
    { value: "monthly", label: "Every Month" },
  ];

  const openAlarmModal = () => setAlarmModalVisible(true);
  const closeAlarmModal = () => setAlarmModalVisible(false);

  const openDateModal = () => setDateModalVisible(true);
  const closeDateModal = () => setDateModalVisible(false);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getDateButtonLabel = () => {
    const timeStr = formatTime(selectedTime);
    if (frequency === "daily") return `Repeat daily at ${timeStr}`;
    if (frequency === "weekly") return `Every week at ${timeStr}`;
    if (frequency === "monthly") return `Every month at ${timeStr}`;
    // Single day - show the date
    const [y, m, d] = selectedDate.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.getTime() === today.getTime()) return `Today at ${timeStr}`;
    if (date.getTime() === tomorrow.getTime()) return `Tomorrow at ${timeStr}`;
    return `${date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} at ${timeStr}`;
  };

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const missingFields: string[] = [];

    if (!trimmedTitle) {
      setTitleError(true);
      missingFields.push("Title");
    }

    if (!trimmedDescription) {
      setDescriptionError(true);
      missingFields.push("Description");
    }

    if (alarmFrequency === null) {
      setAlarmError(true);
      missingFields.push("Alarm interval");
    }

    // Date validation is no longer needed since we default to today

    if (missingFields.length) {
      Toast.error(
        `Please provide: ${missingFields.join(", ")}`,
        "top",
        undefined,
        undefined,
        true,
      );
      return;
    }

    setSaving(true);
    try {
      // Combine selectedDate and selectedTime into a single timestamp
      const [y, m, d] = selectedDate.split("-").map(Number);
      const dateObj = new Date(y, m - 1, d);
      dateObj.setHours(
        selectedTime.getHours(),
        selectedTime.getMinutes(),
        0,
        0,
      );
      const alarmTimeISO = dateObj.toISOString();

      const newTask = await createTask({
        name: trimmedTitle,
        description: trimmedDescription,
        alarm_interval: alarmFrequency!,
        alarm_time: alarmTimeISO,
        frecuency: frequency as Frequency,
      });

      // Schedule notification for the new task
      const hasPermission = await notificationService.requestPermissions();
      if (hasPermission) {
        await notificationService.scheduleNotification(newTask);
      }

      router.replace("/");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to create task.";
      Toast.error(message, "top", undefined, undefined, true);
    } finally {
      setSaving(false);
    }
  };

  // const filteredIcons = iconOptions.filter(
  //   (icon) =>
  //     icon.label.toLowerCase().includes(emojiSearch.toLowerCase()) ||
  //     icon.value.includes(emojiSearch),
  // );

  return (
    <View className="flex-1 bg-white dark:bg-black p-6 gap-5">
      <ToastManager
        position="top"
        theme={colorScheme === "dark" ? "dark" : "light"}
      />

      <View className="gap-1">
        <Text className="text-2xl font-bold dark:text-white">
          Add a new task
        </Text>
        <Text className="text-sm text-black/50 dark:text-white/60">
          Give it a title, context, and how you want to be notified.
        </Text>
      </View>

      <View className="gap-2">
        <Text className="text-base font-semibold dark:text-white">Title</Text>
        <TextInput
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            if (titleError) setTitleError(false);
          }}
          placeholder="e.g. Morning workout"
          placeholderTextColor="#9ca3af"
          className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900 px-4 py-3 text-base dark:text-white"
          style={titleError ? { borderColor: "#ef4444" } : undefined}
        />
      </View>

      <View className="gap-2">
        <Text className="text-base font-semibold dark:text-white">
          Description
        </Text>
        <TextInput
          value={description}
          onChangeText={(text) => {
            setDescription(text);
            if (descriptionError) setDescriptionError(false);
          }}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          placeholder="Add a note or steps you want to remember"
          placeholderTextColor="#9ca3af"
          className="w-full min-h-28 rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900 px-4 py-3 text-base dark:text-white"
          style={descriptionError ? { borderColor: "#ef4444" } : undefined}
        />
      </View>

      {/* Category UI temporarily disabled
      <View className="gap-3">
        <Text className="text-lg font-semibold dark:text-white">
          Categories
        </Text>
        {categories.length > 0 ? (
          <View className="flex-row flex-wrap gap-3">
            {categories.map((category, index) => (
              <View
                key={`${category.name}-${index}`}
                className="flex-row items-center gap-2 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900 px-4 py-2"
              >
                <Feather
                  name={category.icon as any}
                  size={18}
                  color={iconColor}
                />
                <Text className="text-sm font-medium dark:text-white">
                  {category.name}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text className="text-sm text-black/50 dark:text-white/60">
            No categories yet. Add one below.
          </Text>
        )}
        <Button
          variant="outline"
          className="h-12 w-full rounded-xl border border-black/10 dark:border-white/15 justify-center bg-white dark:bg-neutral-900"
          disabled={categories.length >= MAX_CATEGORIES}
          onPress={() => {
            if (categories.length >= MAX_CATEGORIES) return;
            setCategoryStep(1);
            setDraftCategoryName("");
            setDraftIcon(null);
            setEmojiSearch("");
            setEmojiPickerVisible(true);
          }}
        >
          <Text className="text-sm font-semibold">
            {categories.length >= MAX_CATEGORIES
              ? "Max categories reached"
              : "Add"}
          </Text>
        </Button>
        <Text className="text-xs text-black/50 dark:text-white/60">
          You can add up to {MAX_CATEGORIES} categories.
        </Text>
      </View>
      */}

      <View className="gap-2">
        <View className="gap-0.5">
          <Text className="text-base font-semibold dark:text-white">Date</Text>
          <Text className="text-xs text-black/50 dark:text-white/60">
            Choose when to schedule this task.
          </Text>
        </View>
        <Button
          variant="outline"
          className="h-12 w-full rounded-xl border border-black/10 dark:border-white/15 flex-row items-center justify-center gap-2 bg-white dark:bg-neutral-900"
          onPress={openDateModal}
          style={dateError ? { borderColor: "#ef4444" } : undefined}
        >
          <Feather name="calendar" size={18} color={iconColor} />
          <Text className="text-sm font-semibold dark:text-white">
            {getDateButtonLabel()}
          </Text>
        </Button>
      </View>

      <View className="gap-2">
        <View className="gap-0.5">
          <Text className="text-base font-semibold dark:text-white">Alarm</Text>
          <Text className="text-xs text-black/50 dark:text-white/60">
            Choose how often to send the reminder.
          </Text>
        </View>
        <Button
          variant="outline"
          className="h-12 w-full rounded-xl border border-black/10 dark:border-white/15 flex-row items-center justify-center gap-2 bg-white dark:bg-neutral-900"
          onPress={openAlarmModal}
          style={alarmError ? { borderColor: "#ef4444" } : undefined}
        >
          <Feather name="clock" size={18} color={iconColor} />
          <Text className="text-sm font-semibold dark:text-white">
            {alarmFrequency
              ? `Every ${alarmFrequency} min`
              : "Set alarm interval"}
          </Text>
        </Button>
      </View>

      <Button
        className="h-12 rounded-xl shadow-md shadow-black/10 bg-primary dark:bg-primary"
        disabled={saving}
        onPress={handleSave}
      >
        {saving ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text className="text-base font-semibold text-primary-foreground dark:text-black">
            Save task
          </Text>
        )}
      </Button>

      {/* Category modal temporarily disabled
      <Modal
        animationType="slide"
        transparent
        visible={emojiPickerVisible}
        onRequestClose={() => setEmojiPickerVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white dark:bg-neutral-950 rounded-t-3xl p-6 gap-4 h-[70%] max-h-[70%] border border-black/10 dark:border-white/20">
            <View className="h-1 w-12 rounded-full bg-black/10 self-center" />
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold dark:text-white">
                {categoryStep === 1 ? "Name the category" : "Pick an icon"}
              </Text>
              <Pressable
                hitSlop={8}
                onPress={() => setEmojiPickerVisible(false)}
              >
                <Feather name="x" size={22} color={iconColor} />
              </Pressable>
            </View>

            {categoryStep === 1 && (
              <>
                <TextInput
                  value={draftCategoryName}
                  onChangeText={setDraftCategoryName}
                  placeholder="e.g. Morning Routine"
                  placeholderTextColor="#9ca3af"
                  className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900 px-4 py-3 text-base dark:text-white"
                  autoFocus
                />
                <Button
                  className="h-12 rounded-xl"
                  disabled={!draftCategoryName.trim()}
                  onPress={() => setCategoryStep(2)}
                >
                  <Text className="text-sm font-semibold text-primary-foreground">
                    Next: choose emoji
                  </Text>
                </Button>
              </>
            )}

            {categoryStep === 2 && (
              <>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-black/60 dark:text-white/60">
                    Category: {draftCategoryName || "Unnamed"}
                  </Text>
                  <Pressable
                    hitSlop={8}
                    onPress={() => {
                      setCategoryStep(1);
                      setDraftIcon(null);
                    }}
                  >
                    <Text className="text-sm font-semibold text-primary">
                      Go back
                    </Text>
                  </Pressable>
                </View>

                <TextInput
                  value={emojiSearch}
                  onChangeText={setEmojiSearch}
                  placeholder="Search icons..."
                  placeholderTextColor="#9ca3af"
                  className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900 px-4 py-3 text-base dark:text-white"
                />

                <ScrollView
                  className=""
                  contentContainerClassName="flex-row flex-wrap gap-4 justify-center pb-2"
                >
                  {(emojiSearch.trim() ? filteredIcons : iconOptions).map(
                    (icon) => (
                      <Pressable
                        key={icon.label}
                        className={cn(
                          "w-[28%] aspect-square items-center justify-center rounded-2xl border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900 px-3 py-4",
                          draftIcon === icon.value &&
                            "border-primary bg-primary/10",
                        )}
                        onPress={() => {
                          setDraftIcon(icon.value);
                        }}
                        hitSlop={6}
                      >
                        <Feather
                          name={icon.value as any}
                          size={26}
                          color={iconColor}
                        />
                        <Text className="text-[11px] text-black/70 dark:text-white/70 mt-2 text-center">
                          {icon.label}
                        </Text>
                      </Pressable>
                    ),
                  )}
                  {emojiSearch.trim() && filteredIcons.length === 0 && (
                    <View className="w-full items-center py-8">
                      <Text className="text-sm text-black/50 dark:text-white/60">
                        No matches found
                      </Text>
                    </View>
                  )}
                </ScrollView>

                <Button
                  className="h-12 w-full rounded-xl justify-center bg-primary dark:bg-primary"
                  disabled={!draftCategoryName.trim() || !draftIcon}
                  onPress={() => {
                    if (
                      draftCategoryName.trim() &&
                      draftIcon &&
                      categories.length < MAX_CATEGORIES
                    ) {
                      setCategories((prev) => [
                        ...prev,
                        { name: draftCategoryName.trim(), icon: draftIcon },
                      ]);
                    }
                    setEmojiPickerVisible(false);
                    setEmojiSearch("");
                    setDraftCategoryName("");
                    setDraftIcon(null);
                    setCategoryStep(1);
                  }}
                >
                  <Text className="text-sm font-semibold text-white">
                    Finish
                  </Text>
                </Button>
              </>
            )}
          </View>
        </View>
      </Modal>
      */}

      <Modal
        animationType="slide"
        transparent
        visible={alarmModalVisible}
        onRequestClose={closeAlarmModal}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white dark:bg-neutral-950 rounded-t-3xl p-6 gap-4 h-1/2 max-h-[60%] border border-black/10 dark:border-white/20">
            <View className="h-1 w-12 rounded-full bg-black/10 self-center" />
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold dark:text-white">
                Alarm frequency
              </Text>
              <Pressable hitSlop={8} onPress={closeAlarmModal}>
                <Feather name="x" size={22} color={iconColor} />
              </Pressable>
            </View>
            <Text className="text-sm text-black/60 dark:text-white/60">
              Choose how often to send push notifications.
            </Text>
            <ScrollView
              className="flex-1"
              contentContainerClassName="gap-3 pb-4"
            >
              {[1, 2, 3, 4, 5].map((option) => {
                const selected = alarmFrequency === option;
                return (
                  <Pressable
                    key={option}
                    className={`h-12 flex-row items-center justify-between rounded-xl border px-4 ${
                      selected
                        ? "border-primary bg-primary/10"
                        : "border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900"
                    }`}
                    onPress={() => {
                      setAlarmFrequency(option);
                      if (alarmError) setAlarmError(false);
                      closeAlarmModal();
                    }}
                  >
                    <View className="flex-row items-center gap-2">
                      <Feather name="clock" size={18} color={iconColor} />
                      <Text className="text-sm font-semibold dark:text-white">
                        Every {option} min
                      </Text>
                    </View>
                    {selected && <Feather name="check" size={18} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent
        visible={dateModalVisible}
        onRequestClose={closeDateModal}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white dark:bg-neutral-950 rounded-t-3xl p-6 gap-4 max-h-[85%] border border-black/10 dark:border-white/20">
            <View className="h-1 w-12 rounded-full bg-black/10 self-center" />
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold dark:text-white">
                Schedule
              </Text>
              <Pressable hitSlop={8} onPress={closeDateModal}>
                <Feather name="x" size={22} color={iconColor} />
              </Pressable>
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium dark:text-white">
                Frequency
              </Text>
              <Select
                value={{
                  value: frequency,
                  label:
                    frequencyOptions.find((opt) => opt.value === frequency)
                      ?.label || "Single Day",
                }}
                onValueChange={(option) => {
                  if (option) {
                    setFrequency(option.value);
                    // Clear date error if switching to daily (date not required)
                    if (option.value === "daily" && dateError) {
                      setDateError(false);
                    }
                  }
                }}
              >
                <SelectTrigger className="h-12 w-full rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent
                  portalHost="dateModalPortal"
                  style={{ width: windowWidth - 48 }}
                >
                  <SelectGroup className="w-full">
                    {frequencyOptions.map((option, index) => (
                      <View key={option.value}>
                        {index > 0 && <SelectSeparator />}
                        <SelectItem value={option.value} label={option.label}>
                          {option.label}
                        </SelectItem>
                      </View>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </View>

            {frequency !== "daily" && (
              <View className="gap-2">
                <Text className="text-sm font-medium dark:text-white">
                  Select Date
                </Text>
                <View className="rounded-xl overflow-hidden border border-black/10 dark:border-white/15">
                  <Calendar
                    current={selectedDate || undefined}
                    minDate={todayString}
                    onDayPress={(day: { dateString: string }) => {
                      setSelectedDate(day.dateString);
                      if (dateError) setDateError(false);
                    }}
                    markedDates={{
                      [selectedDate]: {
                        selected: true,
                        selectedColor:
                          colorScheme === "dark" ? "#ffffff" : "#000000",
                      },
                    }}
                    theme={{
                      backgroundColor:
                        colorScheme === "dark" ? "#0a0a0a" : "#ffffff",
                      calendarBackground:
                        colorScheme === "dark" ? "#0a0a0a" : "#ffffff",
                      textSectionTitleColor:
                        colorScheme === "dark" ? "#9ca3af" : "#6b7280",
                      selectedDayBackgroundColor:
                        colorScheme === "dark" ? "#ffffff" : "#000000",
                      selectedDayTextColor:
                        colorScheme === "dark" ? "#000000" : "#ffffff",
                      todayTextColor:
                        colorScheme === "dark" ? "#ffffff" : "#000000",
                      dayTextColor:
                        colorScheme === "dark" ? "#ffffff" : "#000000",
                      textDisabledColor:
                        colorScheme === "dark" ? "#4b5563" : "#d1d5db",
                      monthTextColor:
                        colorScheme === "dark" ? "#ffffff" : "#000000",
                      arrowColor:
                        colorScheme === "dark" ? "#ffffff" : "#000000",
                    }}
                  />
                </View>
              </View>
            )}

            <View className="gap-2">
              <Text className="text-sm font-medium dark:text-white">Hour</Text>
              <Pressable
                className="h-12 rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900 flex-row items-center justify-center gap-2"
                onPress={() => setTimePickerOpen(true)}
              >
                <Feather name="clock" size={18} color={iconColor} />
                <Text className="text-sm font-semibold dark:text-white">
                  {formatTime(selectedTime)}
                </Text>
              </Pressable>
              <DatePicker
                modal
                mode="time"
                open={timePickerOpen}
                date={selectedTime}
                onConfirm={(time) => {
                  setTimePickerOpen(false);
                  setSelectedTime(time);
                }}
                onCancel={() => setTimePickerOpen(false)}
                title="Select Time"
                confirmText="Confirm"
                cancelText="Cancel"
                theme={colorScheme === "dark" ? "dark" : "light"}
              />
            </View>

            <Button
              className="h-12 rounded-xl bg-primary dark:bg-primary mt-2"
              onPress={closeDateModal}
            >
              <Text className="text-base font-semibold text-primary-foreground dark:text-black">
                Confirm
              </Text>
            </Button>
          </View>
          <PortalHost name="dateModalPortal" />
        </View>
      </Modal>
    </View>
  );
}
