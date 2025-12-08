import client from "./client";

export const getTasks = async () => {
  const { data, error } = await client
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};
