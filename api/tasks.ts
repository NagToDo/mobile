import client, { supabaseKey, supabaseUrl } from "./client";

export type Task = {
  id: string;
  name: string;
  description: string | null;
  alarm_interval: number | null;
  created_at: string;
};

export const getTasks = async () => {
  const { data: sessionData, error: sessionError } =
    await client.auth.getSession();
  if (sessionError) throw sessionError;
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) throw new Error("Not authenticated.");

  const response = await fetch(
    `${supabaseUrl}/rest/v1/tasks?select=*&order=created_at.desc`,
    {
      headers: {
        apikey: supabaseKey ?? "",
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Unable to load tasks.");
  }

  return (await response.json()) as Task[];
};

export const createTask = async (task: {
  name: string;
  description?: string;
  alarm_interval?: number | null;
}) => {
  const { data: sessionData, error: sessionError } =
    await client.auth.getSession();
  if (sessionError) throw sessionError;
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) throw new Error("Not authenticated.");

  const response = await fetch(`${supabaseUrl}/rest/v1/tasks`, {
    method: "POST",
    headers: {
      apikey: supabaseKey ?? "",
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      name: task.name,
      description: task.description ?? null,
      alarm_interval: task.alarm_interval ?? null,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Unable to create task.");
  }

  return (await response.json())[0] as Task;
};
