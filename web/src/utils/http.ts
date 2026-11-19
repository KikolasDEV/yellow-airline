export class PayloadTooLargeError extends Error {}

export const readBoundedBody = async (request: Request, maximumBytes: number) => {
  const reader = request.body?.getReader();
  if (!reader) return '';
  const decoder = new TextDecoder();
  let text = '';
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maximumBytes) {
        await reader.cancel();
        throw new PayloadTooLargeError('Payload too large');
      }
      text += decoder.decode(value, { stream: true });
    }
    return text + decoder.decode();
  } finally { reader.releaseLock(); }
};

export const parseJsonBody = async <T>(request: Request) => {
  if (!request.headers.get('content-type')?.includes('application/json')) return null;
  try { return JSON.parse(await readBoundedBody(request, 16384)) as T; }
  catch { return null; }
};
