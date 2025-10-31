export function createResponse(
  success: boolean,
  status: number,
  data?: any,
  error?: string,
) {
  return {
    success,
    status,
    ...(data && { data }),
    ...(error && { error }),
  };
}
