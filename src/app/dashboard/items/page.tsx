"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

interface Item {
  id: string;
  name: string;
  type: string | null;
  createdAt: string;
}

async function getItems(): Promise<{ data: Item[]; error?: string }> {
  const res = await fetch("/api/v1/items");
  if (!res.ok) return { data: [], error: "Failed to load items" };
  const json = await res.json();
  return { data: json.data };
}

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    getItems().then((result) => {
      if (!cancelled) {
        setItems(result.data);
        if (result.error) setError(result.error);
      }
    });
    return () => { cancelled = true; };
  }, []);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    startTransition(async () => {
      const res = await fetch("/api/v1/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), type: type.trim() || undefined }),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error?.message ?? "Failed to create item");
        return;
      }

      setName("");
      setType("");
      const result = await getItems();
      setItems(result.data);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const res = await fetch(`/api/v1/items/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setError("Failed to delete item");
        return;
      }
      const result = await getItems();
      setItems(result.data);
    });
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Items</h1>

      {/* Create Item Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create Item</CardTitle>
          <CardDescription>Add a new item to your collection.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Item name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Type (optional)</Label>
              <Input
                id="type"
                placeholder="e.g. reminder, task, note"
                value={type}
                onChange={(e) => setType(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={isPending} className="w-fit">
              {isPending ? "Creating…" : "Create Item"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Items List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Items</CardTitle>
          <CardDescription>
            {items.length === 0
              ? "No items yet. Create one above."
              : `${items.length} item${items.length === 1 ? "" : "s"}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {items.length > 0 && (
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {item.type && (
                      <p className="text-sm text-muted-foreground">{item.type}</p>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                    disabled={isPending}
                    aria-label={`Delete ${item.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
