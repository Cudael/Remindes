"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Edit, Trash2 } from "lucide-react";

interface ItemDetailActionsProps {
  itemId: string;
}

export function ItemDetailActions({ itemId }: ItemDetailActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!confirm("Are you sure you want to delete this item?")) return;
    startTransition(async () => {
      const res = await fetch(`/api/v1/items/${itemId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard/items");
      } else {
        setError("Failed to delete item");
      }
    });
  }

  return (
    <>
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/items")}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0" />
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/items/${itemId}/edit`)}
          >
            <Edit className="mr-1 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isPending}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </>
  );
}
