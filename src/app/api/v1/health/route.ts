import { success } from "@/lib/api-response";

export function GET() {
  return success({ status: "ok" });
}
