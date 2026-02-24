import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, Plus, Search } from "lucide-react";

interface EmptyStateProps {
  searchQuery?: string;
  selectedCategory?: string;
  selectedStatus?: string;
}

export function EmptyState({ searchQuery, selectedCategory, selectedStatus }: EmptyStateProps) {
  const hasFilters =
    !!searchQuery ||
    !!(selectedCategory && selectedCategory !== "") ||
    !!(selectedStatus && selectedStatus !== "");

  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No items found</h3>
        <p className="text-muted-foreground text-center max-w-sm mb-6">
          No items match your current filters. Try adjusting your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <FileQuestion className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No items yet</h3>
      <p className="text-muted-foreground text-center max-w-sm mb-6">
        Start organizing your life by adding your first document or subscription.
        Track expirations, renewals, and never miss an important date again.
      </p>
      <Button asChild>
        <Link href="/dashboard/items/new">
          <Plus className="mr-2 h-4 w-4" />
          Add Your First Item
        </Link>
      </Button>
    </div>
  );
}
