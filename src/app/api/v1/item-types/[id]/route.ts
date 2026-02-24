import { error, success } from "@/lib/api-response";
import { db } from "@/server/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;

  const itemType = await db.itemType.findFirst({
    where: { id, isActive: true },
  });

  if (!itemType) {
    return error("NOT_FOUND", "Item type not found", 404);
  }

  return success(itemType);
}
