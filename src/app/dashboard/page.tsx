import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { requireUser, getOrCreateDbUser } from "@/server/auth";

export default async function Dashboard() {
  const clerkUserId = await requireUser();
  await getOrCreateDbUser(clerkUserId);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Reminders</CardTitle>
          <CardDescription>
            Manage your personal reminders below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="secondary">Create Reminder</Button>
        </CardContent>
      </Card>
    </div>
  );
}
