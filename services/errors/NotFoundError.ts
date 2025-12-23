export class NotFoundError extends Error {
  constructor(
    message: string,
    public readonly entityId?: string,
  ) {
    super(message);
    this.name = "NotFoundError";
  }
}
