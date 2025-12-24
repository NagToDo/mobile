export class DuplicateTaskError extends Error {
  constructor(
    message: string,
    public readonly taskName?: string,
  ) {
    super(message);
    this.name = "DuplicateTaskError";
  }
}
