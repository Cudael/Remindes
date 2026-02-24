"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
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
import { Paperclip, Trash2, X } from "lucide-react";

interface FileRecord {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
}

interface Attachment {
  id: string;
  fileId: string;
  file: FileRecord;
  createdAt: string;
}

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

async function getFiles(): Promise<FileRecord[]> {
  const res = await fetch("/api/v1/files");
  if (!res.ok) return [];
  const json = await res.json();
  return json.data ?? [];
}

async function getAttachments(itemId: string): Promise<Attachment[]> {
  const res = await fetch(`/api/v1/items/${itemId}/attachments`);
  if (!res.ok) return [];
  const json = await res.json();
  return json.data ?? [];
}

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Track attachments per item and which item is expanded
  const [attachments, setAttachments] = useState<Record<string, Attachment[]>>({});
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getItems().then((result) => {
      if (!cancelled) {
        setItems(result.data);
        if (result.error) setError(result.error);
      }
    });
    getFiles().then((data) => {
      if (!cancelled) setFiles(data);
    });
    return () => { cancelled = true; };
  }, []);

  const loadAttachments = useCallback(async (itemId: string) => {
    const data = await getAttachments(itemId);
    setAttachments((prev) => ({ ...prev, [itemId]: data }));
  }, []);

  function toggleAttachments(itemId: string) {
    if (expandedItemId === itemId) {
      setExpandedItemId(null);
    } else {
      setExpandedItemId(itemId);
      loadAttachments(itemId);
    }
  }

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

  function handleAttachFile(itemId: string, fileId: string) {
    startTransition(async () => {
      const res = await fetch(`/api/v1/items/${itemId}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId }),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error?.message ?? "Failed to attach file");
        return;
      }

      await loadAttachments(itemId);
    });
  }

  function handleRemoveAttachment(itemId: string, attachmentId: string) {
    startTransition(async () => {
      const res = await fetch(`/api/v1/items/${itemId}/attachments/${attachmentId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        setError("Failed to remove attachment");
        return;
      }

      await loadAttachments(itemId);
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
              {items.map((item) => {
                const isExpanded = expandedItemId === item.id;
                const itemAttachments = attachments[item.id] ?? [];
                const attachedFileIds = new Set(itemAttachments.map((a) => a.fileId));
                const availableFiles = files.filter((f) => !attachedFileIds.has(f.id));

                return (
                  <li key={item.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.type && (
                          <p className="text-sm text-muted-foreground">{item.type}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => toggleAttachments(item.id)}
                          disabled={isPending}
                          aria-label={`Attachments for ${item.name}`}
                        >
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          disabled={isPending}
                          aria-label={`Delete ${item.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 ml-4 space-y-3">
                        {/* Existing attachments */}
                        {itemAttachments.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">
                              Attached files
                            </p>
                            <ul className="space-y-1">
                              {itemAttachments.map((att) => (
                                <li
                                  key={att.id}
                                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                                >
                                  <span className="truncate">{att.file.originalName}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() =>
                                      handleRemoveAttachment(item.id, att.id)
                                    }
                                    disabled={isPending}
                                    aria-label={`Remove ${att.file.originalName}`}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Add attachment */}
                        {availableFiles.length > 0 ? (
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">
                              Add a file
                            </p>
                            <ul className="space-y-1">
                              {availableFiles.map((file) => (
                                <li key={file.id}>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={() => handleAttachFile(item.id, file.id)}
                                    disabled={isPending}
                                  >
                                    <Paperclip className="mr-2 h-3 w-3" />
                                    {file.originalName}
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {itemAttachments.length > 0
                              ? "All your files are attached."
                              : "No files available. Upload files first."}
                          </p>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
