import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function Dashboard() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Reminders</CardTitle>
          <CardDescription>
            This is a protected route. Authentication coming soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="secondary">Create Reminder</Button>
        </CardContent>
      </Card>
    </div>
  );
}
