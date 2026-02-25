export default function Loading() {
  return (
    <div className="container mx-auto max-w-2xl p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-32 bg-muted rounded-lg" />
        <div className="h-48 bg-muted rounded-lg" />
      </div>
    </div>
  );
}
