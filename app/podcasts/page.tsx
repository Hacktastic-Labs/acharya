import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Headphones, Play, Plus, Search } from "lucide-react"

export default function PodcastsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Podcasts</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search podcasts..." className="w-[200px] pl-8 md:w-[300px]" />
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Podcast
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>History of Computing</CardTitle>
            <CardDescription>15:30 • Generated 3 days ago</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Listen to the evolution of computing from early mechanical devices to modern computers.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Download</Button>
            <Button>
              <Play className="mr-2 h-4 w-4" />
              Listen Now
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Machine Learning Explained</CardTitle>
            <CardDescription>12:45 • Generated 1 week ago</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              A beginner-friendly explanation of machine learning concepts and applications.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Download</Button>
            <Button>
              <Play className="mr-2 h-4 w-4" />
              Listen Now
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Web Development Trends</CardTitle>
            <CardDescription>18:20 • Generated 2 weeks ago</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Current trends and future directions in web development technologies.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Download</Button>
            <Button>
              <Play className="mr-2 h-4 w-4" />
              Listen Now
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quantum Computing Basics</CardTitle>
            <CardDescription>14:10 • Generated 3 weeks ago</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Introduction to quantum bits, quantum gates, and quantum algorithms.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Download</Button>
            <Button>
              <Play className="mr-2 h-4 w-4" />
              Listen Now
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Artificial Intelligence Ethics</CardTitle>
            <CardDescription>20:35 • Generated 1 month ago</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Ethical considerations and challenges in AI development and deployment.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Download</Button>
            <Button>
              <Play className="mr-2 h-4 w-4" />
              Listen Now
            </Button>
          </CardFooter>
        </Card>
        <Card className="flex flex-col items-center justify-center border-dashed p-8 text-center">
          <Headphones className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">Create New Podcast</h3>
          <p className="text-sm text-muted-foreground mb-4">Generate audio from your documents or YouTube videos</p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Podcast
          </Button>
        </Card>
      </div>
    </div>
  )
}

