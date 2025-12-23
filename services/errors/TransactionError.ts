export class TransactionError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error,
    public readonly rollbackData?: unknown,
  ) {
    super(message);
    this.name = "TransactionError";
  }
}
