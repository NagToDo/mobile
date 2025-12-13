import client from "./client";

export type Task = {
  id: string;
  name: string;
  user_id: string;
  description: string;
  alarm_interval: number;
  created_at: string;
  alarm_time: string;
  frecuency: string;
  finished: boolean;
};

export const getTasks = async () => {
  const { data: sessionData, error: sessionError } =
    await client.auth.getSession();
  if (sessionError) throw sessionError;
  const userId = sessionData.session?.user?.id;
  if (!userId) throw new Error("User id missing.");

  const { data, error } = await client
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(
      error.message || error.details || "Unable to load tasks (RLS?).",
    );
  }
  return data as Task[];
};

export const createTask = async (task: {
  name: string;
  description: string;
  alarm_interval: number;
  alarm_time: string;
  frecuency: string;
}) => {
  const { data: sessionData, error: sessionError } =
    await client.auth.getSession();
  if (sessionError) throw sessionError;
  const userId = sessionData.session?.user?.id;
  if (!userId) throw new Error("User id missing.");

  const { data, error } = await client
    .from("tasks")
    .insert({
      name: task.name,
      description: task.description,
      alarm_interval: task.alarm_interval,
      alarm_time: task.alarm_time,
      frecuency: task.frecuency,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(
      error.message || error.details || "Unable to create task (RLS?).",
    );
  }
  return data as Task;
};

export const updateTaskFinished = async (taskId: string, finished: boolean) => {
  const { data: sessionData, error: sessionError } =
    await client.auth.getSession();
  if (sessionError) throw sessionError;
  const userId = sessionData.session?.user?.id;
  if (!userId) throw new Error("User id missing.");

  const { error } = await client
    .from("tasks")
    .update({ finished })
    .eq("id", taskId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(
      error.message || error.details || "Unable to update task (RLS?).",
    );
  }
};

export const getTask = async (taskId: string) => {
  const { data: sessionData, error: sessionError } =
    await client.auth.getSession();
  if (sessionError) throw sessionError;
  const userId = sessionData.session?.user?.id;
  if (!userId) throw new Error("User id missing.");

  const { data, error } = await client
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .eq("user_id", userId)
    .single();

  if (error) {
    throw new Error(
      error.message || error.details || "Unable to load task (RLS?).",
    );
  }
  return data as Task;
};

export const updateTask = async (
  taskId: string,
  task: {
    name: string;
    description: string;
    alarm_interval: number;
    alarm_time: string;
    frecuency: string;
  },
) => {
  const { data: sessionData, error: sessionError } =
    await client.auth.getSession();
  if (sessionError) throw sessionError;
  const userId = sessionData.session?.user?.id;
  if (!userId) throw new Error("User id missing.");

  const { data, error } = await client
    .from("tasks")
    .update({
      name: task.name,
      description: task.description,
      alarm_interval: task.alarm_interval,
      alarm_time: task.alarm_time,
      frecuency: task.frecuency,
    })
    .eq("id", taskId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(
      error.message || error.details || "Unable to update task (RLS?).",
    );
  }
  return data as Task;
};

export const deleteTask = async (taskId: string) => {
  const { data: sessionData, error: sessionError } =
    await client.auth.getSession();
  if (sessionError) throw sessionError;
  const userId = sessionData.session?.user?.id;
  if (!userId) throw new Error("User id missing.");

  const { error } = await client
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(
      error.message || error.details || "Unable to delete task (RLS?).",
    );
  }
};
