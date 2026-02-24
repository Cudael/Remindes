import { success } from "@/lib/api-response";
import { db } from "@/server/db";

export async function GET() {
  const results = await db.itemType.findMany({
    where: { isActive: true },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });

  const categories = results.map((r) => r.category);

  return success(categories);
}
