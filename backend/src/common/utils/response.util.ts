export function success<T>(data: T, message?: string) {
  return { success: true, data, message };
}

export function error(message: string, code?: string) {
  return { success: false, message, code };
}
