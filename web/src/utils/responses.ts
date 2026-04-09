import { NextResponse } from 'next/server';

export const jsonOk = <T>(data: T, init?: ResponseInit) => {
  return NextResponse.json(data, init);
};

export const jsonError = (message: string, status: number, details?: unknown) => {
  return NextResponse.json({ error: message, details }, { status });
};

export const notImplemented = (scope: string) => {
  return jsonError(`${scope} is not implemented yet in the Next.js migration.`, 501);
};
