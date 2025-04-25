import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Plus, Search } from "lucide-react"

export default function SummariesPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Summaries</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search summaries..." className="w-[200px] pl-8 md:w-[300px]" />
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Summary
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Introduction to Neural Networks</CardTitle>
            <CardDescription>Generated from PDF • 3 days ago</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              A comprehensive overview of neural network architecture and applications.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Share</Button>
            <Button>Read Summary</Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>History of Computing</CardTitle>
            <CardDescription>Generated from YouTube • 1 week ago</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Evolution of computing from early mechanical devices to modern computers.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Share</Button>
            <Button>Read Summary</Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quantum Computing Basics</CardTitle>
            <CardDescription>Generated from PDF • 2 weeks ago</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Introduction to quantum bits, quantum gates, and quantum algorithms.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Share</Button>
            <Button>Read Summary</Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Web Development Trends</CardTitle>
            <CardDescription>Generated from PDF • 3 weeks ago</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Current trends and future directions in web development technologies.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Share</Button>
            <Button>Read Summary</Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Artificial Intelligence Ethics</CardTitle>
            <CardDescription>Generated from YouTube • 1 month ago</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Ethical considerations and challenges in AI development and deployment.
            </p>
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <DashboardShell>
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Summaries</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search summaries..." className="w-[200px] pl-8 md:w-[300px]" />
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Summary
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Introduction to Neural Networks</CardTitle>
              <CardDescription>Generated from PDF • 3 days ago</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                A comprehensive overview of neural network architecture and applications.
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Share</Button>
              <Button>Read Summary</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>History of Computing</CardTitle>
              <CardDescription>Generated from YouTube • 1 week ago</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Evolution of computing from early mechanical devices to modern computers.
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Share</Button>
              <Button>Read Summary</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Quantum Computing Basics</CardTitle>
              <CardDescription>Generated from PDF • 2 weeks ago</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Introduction to quantum bits, quantum gates, and quantum algorithms.
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Share</Button>
              <Button>Read Summary</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Web Development Trends</CardTitle>
              <CardDescription>Generated from PDF • 3 weeks ago</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Current trends and future directions in web development technologies.
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Share</Button>
              <Button>Read Summary</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Artificial Intelligence Ethics</CardTitle>
              <CardDescription>Generated from YouTube • 1 month ago</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ethical considerations and challenges in AI development and deployment.
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Share</Button>
              <Button>Read Summary</Button>
            </CardFooter>
          </Card>
          <Card className="flex flex-col items-center justify-center border-dashed p-8 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">Create New Summary</h3>
            <p className="text-sm text-muted-foreground mb-4">Upload a document or add a YouTube link</p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Summary
            </Button>
          </Card>
        </div>
      </DashboardShell>
    </div>
  )
}

