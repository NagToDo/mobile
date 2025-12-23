import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useTask } from "@/hooks/useTask";
import { Frequency } from "@/domain/models/Task";
import { notificationService } from "@/services/notification";
import Feather from "@expo/vector-icons/Feather";
import { PortalHost } from "@rn-primitives/portal";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import DatePicker from "react-native-date-picker";
import ToastManager, { Toast } from "toastify-react-native";

export default function TaskDetail() {
  const { colorScheme } = useColorScheme();
  const { width: windowWidth } = useWindowDimensions();
  const iconColor = colorScheme === "dark" ? "#fff" : "#000";
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    task,
    loading,
    error: taskError,
    updateTask,
    deleteTask,
  } = useTask(id || "");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [alarmModalVisible, setAlarmModalVisible] = useState(false);
  const [alarmFrequency, setAlarmFrequency] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [descriptionError, setDescriptionError] = useState(false);
  const [alarmError, setAlarmError] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Date modal state
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [frequency, setFrequency] = useState<string>("single");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
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

  const error = taskError?.message ?? null;

  useEffect(() => {
    if (task && !initialized) {
      setTitle(task.name);
      setDescription(task.description || "");
      setAlarmFrequency(task.alarm_interval);
      setFrequency(task.frecuency);

      if (task.alarm_time) {
        const alarmDate = new Date(task.alarm_time);
        const year = alarmDate.getFullYear();
        const month = String(alarmDate.getMonth() + 1).padStart(2, "0");
        const day = String(alarmDate.getDate()).padStart(2, "0");
        setSelectedDate(`${year}-${month}-${day}`);
        setSelectedTime(alarmDate);
      }
      setInitialized(true);
    }
  }, [task, initialized]);

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
    if (!selectedDate) return "Select date";
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
    if (!id) return;

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

    // Date is required for non-daily frequencies
    if (frequency !== "daily" && !selectedDate) {
      setDateError(true);
      missingFields.push("Date");
    }

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
      // For daily frequency, use today's date as base
      let baseDateStr = selectedDate;
      if (!baseDateStr) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        baseDateStr = `${year}-${month}-${day}`;
      }

      const [y, m, d] = baseDateStr.split("-").map(Number);
      const dateObj = new Date(y, m - 1, d);
      dateObj.setHours(
        selectedTime.getHours(),
        selectedTime.getMinutes(),
        0,
        0,
      );
      const alarmTimeISO = dateObj.toISOString();

      const updatedTaskData = await updateTask({
        name: trimmedTitle,
        description: trimmedDescription,
        alarm_interval: alarmFrequency!,
        alarm_time: alarmTimeISO,
        frecuency: frequency as Frequency,
      });

      // Update the scheduled notification
      const hasPermission = await notificationService.requestPermissions();
      if (hasPermission) {
        await notificationService.scheduleNotification(updatedTaskData);
      }

      Toast.success("Task updated", "top", undefined, undefined, true);
      router.replace("/");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to update task.";
      Toast.error(message, "top", undefined, undefined, true);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      // Cancel the notification before deleting the task
      await notificationService.cancelNotification(id);
      await deleteTask();
      setDeleteDialogOpen(false);
      router.replace("/");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to delete task.";
      Toast.error(message, "top", undefined, undefined, true);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white dark:bg-black items-center justify-center">
        <ActivityIndicator size="large" color={iconColor} />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-white dark:bg-black items-center justify-center p-6">
        <Text className="text-sm text-red-500 text-center mb-4">{error}</Text>
        <Button variant="outline" size="sm" onPress={() => router.back()}>
          <Text className="text-xs font-semibold">Go Back</Text>
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-black"
      contentContainerClassName="p-6 gap-5 pb-12"
      showsVerticalScrollIndicator={false}
    >
      <ToastManager
        position="top"
        theme={colorScheme === "dark" ? "dark" : "light"}
      />

      <View className="gap-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold dark:text-white">Edit Task</Text>
          <Pressable hitSlop={8} onPress={handleDelete} disabled={deleting}>
            <Feather name="trash-2" size={22} color="#ef4444" />
          </Pressable>
        </View>
        <Text className="text-sm text-black/50 dark:text-white/60">
          Update your task details below.
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
            Save changes
          </Text>
        )}
      </Button>

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
                    current={selectedDate || todayString}
                    minDate={todayString}
                    onDayPress={(day: { dateString: string }) => {
                      setSelectedDate(day.dateString);
                      if (dateError) setDateError(false);
                    }}
                    markedDates={
                      selectedDate
                        ? {
                            [selectedDate]: {
                              selected: true,
                              selectedColor:
                                colorScheme === "dark" ? "#ffffff" : "#000000",
                            },
                          }
                        : {}
                    }
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-[280px] bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/20 rounded-2xl p-5">
          <DialogHeader className="gap-2">
            <DialogTitle className="text-base">Delete Task</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to delete this task? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-3 mt-2">
            <Button
              variant="outline"
              className="flex-1 h-11 rounded-xl"
              onPress={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              <Text className="font-semibold">Cancel</Text>
            </Button>
            <Button
              variant="destructive"
              className="flex-1 h-11 rounded-xl"
              onPress={confirmDelete}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="font-semibold text-white">Delete</Text>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ScrollView>
  );
}
