"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
function getGeminiModel(modelName: string = "gemini-2.5-flash-lite") {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing Gemini API key");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: modelName });
}

/**
 * Formats unstructured or poorly formatted flashcard text into a consistent format
 * using Gemini AI
 *
 * @param text The unstructured flashcard text to format
 * @returns Properly formatted flashcard text in Q/A format
 */
export async function formatFlashcardsWithGemini(
  text: string
): Promise<string> {
  try {
    const model = getGeminiModel();

    const prompt = `
    I have some flashcard content that needs to be formatted properly. Please convert the following content into a well-structured set of flashcards in this exact format:

    * **Q:** [Question text]  
    * **A:** [Answer text]

    Make sure each flashcard has a clear question and answer, with a blank line between different flashcards.
    If the content already contains questions and answers, extract and format them correctly.
    If the content is just paragraphs of information, create appropriate question-answer pairs from the key points.
    
    Here's the content to format:
    
    ${text}
    `;

    const result = await model.generateContent(prompt);
    const formattedText = result.response.text();

    // Clean up the response to ensure it's in the correct format
    return formattedText
      .replace(/```markdown|```/g, "") // Remove markdown code blocks if present
      .trim();
  } catch (error) {
    console.error("Error formatting flashcards with Gemini:", error);
    // Return the original text if there's an error
    return text;
  }
}

// Define the Flashcard type
export interface Flashcard {
  question: string;
  answer: string;
}

/**
 * Attempts to parse flashcards from text in various formats
 * If parsing fails, it returns an empty array
 */
export async function parseFlashcardsFromText(
  text: string
): Promise<Flashcard[]> {
  if (!text) return [];

  // Try various parsing strategies

  // Strategy 1: Standard Q/A format with asterisks
  const standardFormat = parseStandardFormat(text);
  if (standardFormat.length > 0) return standardFormat;

  // Strategy 2: Q: A: format without asterisks
  const simpleFormat = parseSimpleFormat(text);
  if (simpleFormat.length > 0) return simpleFormat;

  // Strategy 3: Question/Answer paragraph format
  const paragraphFormat = parseParagraphFormat(text);
  if (paragraphFormat.length > 0) return paragraphFormat;

  // No valid format found
  return [];
}

// Parse standard format: * **Q:** Question \n * **A:** Answer
function parseStandardFormat(text: string): Flashcard[] {
  const flashcards: Flashcard[] = [];

  // Split by new Q indicators
  const blocks = text.split(/\n\s*\*\s*\*\*Q:/i);

  // Process each block (skip first if empty)
  for (let i = 1; i < blocks.length; i++) {
    const block = "**Q:" + blocks[i]; // Add back the prefix we split on

    // Extract question and answer
    const questionMatch = block.match(
      /\*\*Q:\*\*\s*(.*?)(?=\n\s*\*\s*\*\*A:|$)/i
    );
    const answerMatch = block.match(
      /\*\*A:\*\*\s*(.*?)(?=\n\s*\*\s*\*\*Q:|$)/i
    );

    if (questionMatch && answerMatch) {
      flashcards.push({
        question: questionMatch[1].trim(),
        answer: answerMatch[1].trim(),
      });
    }
  }

  return flashcards;
}

// Parse simple format: Q: Question \n A: Answer
function parseSimpleFormat(text: string): Flashcard[] {
  const flashcards: Flashcard[] = [];

  // Split by new Q indicators
  const blocks = text.split(/\n\s*Q:/i);

  // Process each block (skip first if empty)
  for (let i = 1; i < blocks.length; i++) {
    const block = "Q:" + blocks[i]; // Add back the prefix we split on

    // Extract question and answer
    const questionMatch = block.match(/Q:\s*(.*?)(?=\n\s*A:|$)/i);
    const answerMatch = block.match(/A:\s*(.*?)(?=\n\s*Q:|$)/i);

    if (questionMatch && answerMatch) {
      flashcards.push({
        question: questionMatch[1].trim(),
        answer: answerMatch[1].trim(),
      });
    }
  }

  return flashcards;
}

// Parse paragraph format: Question paragraph \n Answer paragraph
function parseParagraphFormat(text: string): Flashcard[] {
  const flashcards: Flashcard[] = [];

  // Look for paragraphs that end with question marks followed by paragraphs
  const paragraphs = text.split(/\n\s*\n/);

  for (let i = 0; i < paragraphs.length - 1; i++) {
    const para = paragraphs[i].trim();
    const nextPara = paragraphs[i + 1].trim();

    // If paragraph ends with question mark, treat as Q/A pair
    if (para.endsWith("?")) {
      flashcards.push({
        question: para,
        answer: nextPara,
      });
      i++; // Skip the answer paragraph in next iteration
    }
  }

  return flashcards;
}
