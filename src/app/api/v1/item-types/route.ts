import { success } from "@/lib/api-response";
import { db } from "@/server/db";

export async function GET() {
  const itemTypes = await db.itemType.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return success(itemTypes);
}
