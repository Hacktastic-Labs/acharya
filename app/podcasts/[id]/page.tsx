import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardShell } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Download,
  Share2,
  BookOpen,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";

export default function PodcastPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <DashboardShell>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              History of Computing
            </h2>
            <p className="text-muted-foreground">
              15:30 • Generated 3 days ago
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button size="sm">
              <BookOpen className="mr-2 h-4 w-4" />
              View Transcript
            </Button>
          </div>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <div className="w-48 h-48 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-lg flex items-center justify-center mb-6">
                <Volume2 className="h-24 w-24 text-primary/60" />
              </div>

              <div className="w-full max-w-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">4:15</span>
                  <span className="text-sm text-muted-foreground">15:30</span>
                </div>
                <Slider
                  defaultValue={[27]}
                  max={100}
                  step={1}
                  className="mb-6"
                />

                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button size="icon" className="h-14 w-14 rounded-full">
                    <Play className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4">Transcript</h3>
            <div className="prose dark:prose-invert max-w-none">
              <p>
                Welcome to this audio summary on the History of Computing.
                Today, we'll explore the fascinating evolution of computing
                technology from its earliest mechanical beginnings to the
                powerful digital systems we use today.
              </p>

              <p>
                The story of computing begins long before electronic computers.
                In ancient times, civilizations used simple calculating tools
                like the abacus. These early devices helped with basic
                arithmetic but lacked the ability to perform complex
                calculations automatically.
              </p>

              <p>
                The first major breakthrough came in the 17th century when
                Blaise Pascal invented a mechanical calculator called the
                Pascaline. This was followed by Gottfried Wilhelm Leibniz's
                Stepped Reckoner, which could perform all four arithmetic
                operations.
              </p>

              <p>
                The 19th century saw Charles Babbage design the Difference
                Engine and later the Analytical Engine, which incorporated many
                features of modern computers including conditional branching and
                memory. Though never fully built in his lifetime, Babbage's
                designs were revolutionary. Ada Lovelace, often considered the
                first programmer, wrote theoretical operations for the
                Analytical Engine.
              </p>

              <p>
                The early 20th century brought electromechanical computers like
                the Harvard Mark I and advances in theoretical computer science
                from Alan Turing. World War II accelerated development with
                machines like the British Colossus and the American ENIAC, often
                considered the first general-purpose electronic computer.
              </p>

              <p>
                The invention of the transistor in 1947 at Bell Labs marked the
                beginning of the electronic age of computing. Transistors
                replaced vacuum tubes, making computers smaller, faster, and
                more reliable. This led to the development of mainframe
                computers in the 1950s and 1960s by companies like IBM.
              </p>

              <p>
                The 1970s saw the birth of the microprocessor, with Intel's 4004
                being the first commercially available microprocessor. This
                innovation paved the way for personal computers, with the Altair
                8800, Apple II, and IBM PC bringing computing to homes and small
                businesses.
              </p>

              <p>
                The 1980s and 1990s witnessed the rise of graphical user
                interfaces, the internet, and mobile computing. Microsoft
                Windows and Apple's Macintosh made computers more accessible to
                non-technical users, while the World Wide Web, created by Tim
                Berners-Lee in 1989, transformed how information was shared.
              </p>

              <p>
                The 21st century has seen exponential growth in computing power,
                following Moore's Law, which predicted that the number of
                transistors on a microchip would double approximately every two
                years. Cloud computing, artificial intelligence, quantum
                computing, and the Internet of Things represent the cutting edge
                of today's computing landscape.
              </p>

              <p>
                From mechanical calculators to quantum computers, the history of
                computing reflects humanity's ingenuity and our constant drive
                to process information more efficiently. Each innovation has
                built upon previous technologies, creating a rich tapestry of
                development that continues to evolve today.
              </p>

              <p>
                Thank you for listening to this summary of the History of
                Computing. For more detailed information, please refer to the
                full document or generate flashcards to test your knowledge on
                this topic.
              </p>
            </div>
          </CardContent>
        </Card>
      </DashboardShell>
    </div>
  );
}
