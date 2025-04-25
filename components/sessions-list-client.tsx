"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";

interface Session {
  id: number;
  title: string;
  description: string | null;
  createdAt: Date;
}

interface SessionsListClientProps {
  sessions: Session[];
}

export function SessionsListClient({ sessions }: SessionsListClientProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button asChild>
          <Link href="/upload">
            <Plus className="mr-2 h-4 w-4" />
            New Session
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sessions.map((session) => (
          <Card key={session.id}>
            <CardHeader>
              <CardTitle>{session.title}</CardTitle>
              <CardDescription>
                Created{" "}
                {session.createdAt
                  ? new Date(session.createdAt).toLocaleDateString()
                  : "Unknown date"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {session.description || "No description provided"}
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <Link href={`/sessions/${session.id}`}>Open Session</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
