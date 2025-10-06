import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardHeader } from "@/components/dashboard-header";
import { RecentUploads } from "@/components/recent-uploads";
import { UploadButton } from "@/components/upload-button";
import { Overview } from "@/components/overview";
import SessionsList from "@/components/sessions-list";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.userId) {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex justify-center items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-center">
            Your Sessions
          </h2>
        </div>
        <SessionsList />
      </div>
    </div>
  );
}
