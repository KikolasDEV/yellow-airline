export const parseJsonBody = async <T>(request: Request) => {
  return request.json() as Promise<T>;
};
