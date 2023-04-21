export interface ApiResponse<T> {
  ok: boolean;
  statusCode: number;
  message?: string;
  data?: T | unknown;
}
