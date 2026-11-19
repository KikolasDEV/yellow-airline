import { NextResponse } from 'next/server';

export const jsonOk = <T>(data: T, init?: ResponseInit) => {
  const headers = new Headers(init?.headers);
  headers.set('Cache-Control', 'private, no-store');
  return NextResponse.json(data, { ...init, headers });
};

export const jsonError = (message: string, status: number, details?: unknown) => {
  return jsonOk({ error: message, details }, { status });
};
