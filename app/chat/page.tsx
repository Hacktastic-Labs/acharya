"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card } from "@/components/ui/card";
import { EnhancedChat } from "@/components/enhanced-chat";

export default function ChatPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <DashboardShell>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              AI Chat Assistant
            </h2>
            <p className="text-muted-foreground">
              Chat with your AI assistant about your documents and learning
              materials
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          <Card className="p-0 overflow-hidden">
            <EnhancedChat
              className="border-0 shadow-none h-[calc(100vh-16rem)]"
              initialMessage="Hello! I'm your AI learning assistant. I can help you understand your documents, answer questions, and explain concepts. What would you like to know?"
            />
          </Card>
        </div>
      </DashboardShell>
    </div>
  );
}
