import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookOpen, Plus, Search } from "lucide-react"

export default function FlashcardsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Flashcards</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search flashcards..." className="w-[200px] pl-8 md:w-[300px]" />
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Set
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Machine Learning Basics</CardTitle>
            <CardDescription>20 cards • Created 3 days ago</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Core concepts and terminology for machine learning fundamentals.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Edit</Button>
            <Button>Study Now</Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Data Structures</CardTitle>
            <CardDescription>15 cards • Created 1 week ago</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Arrays, linked lists, trees, and other fundamental data structures.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Edit</Button>
            <Button>Study Now</Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Web Development</CardTitle>
            <CardDescription>25 cards • Created 2 weeks ago</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              HTML, CSS, JavaScript and modern web development concepts.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Edit</Button>
            <Button>Study Now</Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quantum Computing</CardTitle>
            <CardDescription>12 cards • Created 3 weeks ago</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Introduction to quantum bits, quantum gates, and quantum algorithms.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Edit</Button>
            <Button>Study Now</Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Artificial Intelligence</CardTitle>
            <CardDescription>18 cards • Created 1 month ago</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              AI concepts, neural networks, and machine learning algorithms.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Edit</Button>
            <Button>Study Now</Button>
          </CardFooter>
        </Card>
        <Card className="flex flex-col items-center justify-center border-dashed p-8 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">Create New Flashcard Set</h3>
          <p className="text-sm text-muted-foreground mb-4">Upload a document or add content manually</p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Set
          </Button>
        </Card>
      </div>
    </div>
  )
}

