import { NextResponse } from "next/server";

/**
 * Standard success envelope: { data: T }
 */
export function success<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

/**
 * Standard error envelope: { error: { code, message, details? } }
 */
export function error(
  code: string,
  message: string,
  status = 400,
  details?: unknown,
) {
  return NextResponse.json(
    { error: { code, message, ...(details !== undefined && { details }) } },
    { status },
  );
}
