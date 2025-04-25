import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, Share2, BookOpen } from "lucide-react";

export default function SummaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Introduction to Neural Networks
          </h2>
          <p className="text-muted-foreground">
            Generated from PDF • 3 days ago
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
            Generate Flashcards
          </Button>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
          <CardDescription>Key points from the document</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Neural networks are computational models inspired by the human
              brain's structure and function.
            </li>
            <li>
              They consist of interconnected nodes (neurons) organized in
              layers that process information.
            </li>
            <li>
              Deep learning is a subset of neural networks with multiple
              hidden layers.
            </li>
            <li>
              Neural networks excel at pattern recognition, classification,
              and prediction tasks.
            </li>
            <li>
              Training involves adjusting weights through backpropagation to
              minimize error.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Summary</CardTitle>
          <CardDescription>
            Comprehensive overview of the document
          </CardDescription>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <h3>Introduction</h3>
          <p>
            Neural networks represent a fundamental paradigm shift in
            computing, moving away from traditional algorithmic approaches
            toward systems that can learn from data. Inspired by the
            biological neural networks in the human brain, artificial neural
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <DashboardShell>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Introduction to Neural Networks
            </h2>
            <p className="text-muted-foreground">
              Generated from PDF • 3 days ago
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
              Generate Flashcards
            </Button>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Executive Summary</CardTitle>
            <CardDescription>Key points from the document</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Neural networks are computational models inspired by the human
                brain's structure and function.
              </li>
              <li>
                They consist of interconnected nodes (neurons) organized in
                layers that process information.
              </li>
              <li>
                Deep learning is a subset of neural networks with multiple
                hidden layers.
              </li>
              <li>
                Neural networks excel at pattern recognition, classification,
                and prediction tasks.
              </li>
              <li>
                Training involves adjusting weights through backpropagation to
                minimize error.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detailed Summary</CardTitle>
            <CardDescription>
              Comprehensive overview of the document
            </CardDescription>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <h3>Introduction</h3>
            <p>
              Neural networks represent a fundamental paradigm shift in
              computing, moving away from traditional algorithmic approaches
              toward systems that can learn from data. Inspired by the
              biological neural networks in the human brain, artificial neural
              networks (ANNs) have become the backbone of modern artificial
              intelligence and machine learning applications.
            </p>

            <h3>Structure and Components</h3>
            <p>
              At their core, neural networks consist of layers of interconnected
              nodes or "neurons." A typical neural network architecture
              includes:
            </p>
            <ul>
              <li>
                <strong>Input Layer:</strong> Receives the initial data or
                features
              </li>
              <li>
                <strong>Hidden Layers:</strong> Process the information through
                weighted connections
              </li>
              <li>
                <strong>Output Layer:</strong> Produces the final prediction or
                classification
              </li>
            </ul>
            <p>
              Each neuron applies an activation function to the weighted sum of
              its inputs, introducing non-linearity that allows the network to
              learn complex patterns.
            </p>

            <h3>Training Process</h3>
            <p>
              Neural networks learn through a process called training, which
              involves:
            </p>
            <ol>
              <li>
                <strong>Forward Propagation:</strong> Data passes through the
                network to generate predictions
              </li>
              <li>
                <strong>Error Calculation:</strong> The difference between
                predictions and actual values is measured
              </li>
              <li>
                <strong>Backpropagation:</strong> The error is propagated
                backward to adjust connection weights
              </li>
              <li>
                <strong>Optimization:</strong> Weights are updated using
                algorithms like gradient descent
              </li>
            </ol>
            <p>
              This iterative process continues until the network achieves
              satisfactory performance on the training data.
            </p>

            <h3>Types of Neural Networks</h3>
            <p>
              Various neural network architectures have been developed for
              specific tasks:
            </p>
            <ul>
              <li>
                <strong>Feedforward Neural Networks:</strong> The simplest form
                where information flows in one direction
              </li>
              <li>
                <strong>Convolutional Neural Networks (CNNs):</strong>{" "}
                Specialized for image processing and computer vision
              </li>
              <li>
                <strong>Recurrent Neural Networks (RNNs):</strong> Designed for
                sequential data like text and time series
              </li>
              <li>
                <strong>Long Short-Term Memory (LSTM):</strong> A type of RNN
                that addresses the vanishing gradient problem
              </li>
              <li>
                <strong>Generative Adversarial Networks (GANs):</strong> Used
                for generating new data similar to training data
              </li>
            </ul>

            <h3>Applications</h3>
            <p>Neural networks have revolutionized numerous fields:</p>
            <ul>
              <li>Computer vision and image recognition</li>
              <li>Natural language processing and translation</li>
              <li>Speech recognition and synthesis</li>
              <li>Medical diagnosis and drug discovery</li>
              <li>Financial forecasting and fraud detection</li>
              <li>Autonomous vehicles and robotics</li>
            </ul>

            <h3>Challenges and Limitations</h3>
            <p>Despite their power, neural networks face several challenges:</p>
            <ul>
              <li>Require large amounts of training data</li>
              <li>Computationally intensive to train</li>
              <li>Prone to overfitting without proper regularization</li>
              <li>Lack interpretability (the "black box" problem)</li>
              <li>Sensitive to hyperparameter choices</li>
            </ul>

            <h3>Conclusion</h3>
            <p>
              Neural networks represent one of the most significant advances in
              computing of the past few decades. As research continues and
              computational resources improve, their capabilities and
              applications will likely expand further, driving innovation across
              industries and scientific disciplines.
            </p>
          </CardContent>
        </Card>
      </DashboardShell>
    </div>
  );
}
