export type ApiErrorStatus = 400 | 404 | 409 | 500;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: ApiErrorStatus,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function badRequest(message: string): ApiError {
  return new ApiError(message, 400);
}

export function notFound(message: string): ApiError {
  return new ApiError(message, 404);
}

export function conflict(message: string): ApiError {
  return new ApiError(message, 409);
}

export function internalError(message: string): ApiError {
  return new ApiError(message, 500);
}

export function toApiError(error: unknown, fallbackMessage: string): ApiError {
  if (error instanceof ApiError) return error;
  return internalError(error instanceof Error ? error.message : fallbackMessage);
}

export function mapReservationPersistenceError(error: unknown, fallbackMessage: string): ApiError {
  const message = error instanceof Error ? error.message : fallbackMessage;

  if (message.includes("予約番号またはメールアドレスが正しくありません")) {
    return notFound(message);
  }

  if (
    message.includes("現在予約できません") ||
    message.includes("この予約は") ||
    message.includes("定員を超えています")
  ) {
    return conflict(message);
  }

  if (
    message.includes("宿泊日を確認") ||
    message.includes("宿泊人数・客室数") ||
    message.includes("宿泊者全員") ||
    message.includes("代表者情報") ||
    message.includes("支払方法") ||
    message.includes("組み合わせは予約できません") ||
    message.includes("客室が見つかりません")
  ) {
    return badRequest(message);
  }

  return internalError(message);
}
