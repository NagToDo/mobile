import { Task } from "../../domain/models/Task";

export class ConflictError extends Error {
  constructor(
    message: string,
    public readonly localTask?: Task,
    public readonly remoteTask?: Task,
  ) {
    super(message);
    this.name = "ConflictError";
  }
}
