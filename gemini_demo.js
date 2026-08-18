import { GoogleGenAI, Type } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
// Using gemini-1.5-flash since 3.5 does not exist.
const MODEL_NAME = 'gemini-3.6-flash';

/**
 * 1. Chatbot Module
 * Handles back-and-forth user conversations.
 */
export async function runChatbot() {
    console.log("=== Starting Chatbot ===");
    try {
        const chat = ai.chats.create({
            model: MODEL_NAME,
            config: {
                systemInstruction: "You are a helpful assistant.",
                temperature: 0.7
            }
        });

        console.log("User: Hello! Who are you?");
        let response = await chat.sendMessage({ message: "Hello! Who are you?" });
        console.log("Bot:", response.text);

        console.log("User: What can you help me with today?");
        response = await chat.sendMessage({ message: "What can you help me with today?" });
        console.log("Bot:", response.text);
    } catch (error) {
        console.error("Chatbot Error:", error);
    }
}

/**
 * 2. Quiz Maker Module
 * Takes a topic and returns structured JSON with 5 multiple-choice questions.
 */
export async function createQuiz(topic) {
    console.log(`\n=== Creating Quiz on topic: ${topic} ===`);
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `Create a quiz about ${topic} with 5 multiple-choice questions.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    description: "List of multiple-choice questions.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: {
                                type: Type.STRING,
                                description: "The quiz question."
                            },
                            options: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.STRING
                                },
                                description: "4 possible answers."
                            },
                            correctAnswerIndex: {
                                type: Type.INTEGER,
                                description: "The zero-based index of the correct answer in the options array."
                            }
                        },
                        required: ["question", "options", "correctAnswerIndex"]
                    }
                }
            }
        });

        const quizData = JSON.parse(response.text);
        console.log("Quiz Output:", JSON.stringify(quizData, null, 2));
        return quizData;
    } catch (error) {
        console.error("Quiz Maker Error:", error);
    }
}

/**
 * 3. Transcript Generator Module
 * Converts raw text notes into a clean transcript with headings, bullet points, etc.
 */
export async function generateTranscript(rawText) {
    console.log("\n=== Generating Transcript ===");
    try {
        const prompt = `
Please convert the following raw notes into a clean, well-formatted transcript.
Include headings, bullet points, and a "Key Takeaways" section at the end.

Raw Notes:
${rawText}
`;
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
        });

        console.log("Transcript Output:\n");
        console.log(response.text);
        return response.text;
    } catch (error) {
        console.error("Transcript Generator Error:", error);
    }
}

// === Run Complete Example ===
async function main() {
    if (!process.env.GEMINI_API_KEY) {
        console.error("Error: GEMINI_API_KEY is missing from .env file");
        return;
    }

    // 1. Test Chatbot
    await runChatbot();

    // 2. Test Quiz Maker
    await createQuiz("JavaScript History");

    // 3. Test Transcript Generator
    const rawNotes = "meeting started 10am. discussed Q3 goals. sales need to go up 20%. bob will handle new marketing campaign. sarah is doing product update by next week. meeting ended 10:30am.";
    await generateTranscript(rawNotes);
}

// Execute the test script if run directly
main();
