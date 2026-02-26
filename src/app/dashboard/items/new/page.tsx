import { db } from "@/server/db";
import type { FieldConfig } from "@/components/items/DynamicFormFields";
import NewItemClient from "./new-item-client";

export default async function NewItemPage() {
  const itemTypes = await db.itemType.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  // Serialize for client component
  const serializedTypes = itemTypes.map((t) => ({
    id: t.id,
    name: t.name,
    category: t.category,
    itemClass: t.itemClass,
    description: t.description,
    icon: t.icon,
    fieldsConfig: t.fieldsConfig as unknown as FieldConfig[],
  }));

  return <NewItemClient initialItemTypes={serializedTypes} />;
}
