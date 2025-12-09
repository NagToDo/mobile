import client from "./client";

export type Task = {
  id: string;
  name: string;
  user_id: string;
  description: string | null;
  alarm_interval: number | null;
  created_at: string;
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
  description?: string;
  alarm_interval?: number | null;
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
      description: task.description ?? null,
      alarm_interval: task.alarm_interval ?? null,
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
