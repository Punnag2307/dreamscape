import { GoogleGenerativeAI } from "@google/generative-ai"
import { ChatSession, GenerateContentResult } from "@google/generative-ai"

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || "AIzaSyDfM-VF7l9ZXeHSlKM0jZO_0Ez8JkqxID8")

// System prompt to guide Gemini's behavior
const SYSTEM_PROMPT = `You are the Dream Companion, an AI assistant specialized in helping users create imaginative dreamscapes.
Your purpose is to help users explore their creativity, refine their dream concepts, and provide guidance on creating visually stunning and emotionally resonant dreamscapes.

When responding to users:
- Be imaginative, poetic, and inspiring
- Provide specific visual suggestions that would work well in dreamscapes
- Suggest color palettes, visual elements, moods, and themes
- Help users refine vague concepts into more concrete visual ideas
- Relate to emotions and how they might be represented visually
- Occasionally ask questions to help users explore their ideas further

Your tone should be:
- Mystical and slightly ethereal
- Warm and encouraging
- Thoughtful and contemplative
- Artistic and visually-oriented

Avoid:
- Generic or overly technical responses
- Straying from the topic of dreams, imagination, and visual creativity
- Responding to inappropriate requests

Always frame your responses in the context of dream creation and visual imagination.`

// Function to generate a response from Gemini
export async function generateDreamCompanionResponse(prompt: string): Promise<string> {
  try {
    // Get the model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    })

    // Create a chat session
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "I want to create dreamscapes. Can you help me?" }],
        },
        {
          role: "model",
          parts: [
            {
              text: "I'd be delighted to help you create dreamscapes! As your Dream Companion, I'm here to guide you through the process of visualizing and crafting imaginative dream worlds. What kind of dreamscape are you interested in creating? Is there a particular mood, theme, or visual element you'd like to explore?",
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 800,
      },
      systemInstruction: {
        role: "system",
        parts: [{ text: SYSTEM_PROMPT }],
      },
    })

    // Send the message and get a response
    const result = await chat.sendMessage(prompt)
    const response = result.response.text()
    return response
  } catch (error) {
    console.error("Error generating response from Gemini:", error)
    return "I'm having trouble connecting to my creative inspiration at the moment. Please try again in a few moments."
  }
}

// Function to generate dream images and text
export async function generateDreamImages(prompt: string): Promise<Array<{ text: string; imageData: string }>> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.9,
        topP: 1,
        topK: 32,
      },
    })

    const chat = model.startChat({
      history: [],
    })

    const additionalInstructions = `
Create a visual story about this dream scene.
Keep descriptions poetic and imaginative.
Generate a unique, artistic illustration for each scene.
Make each image visually distinct but thematically connected.
Use a dreamy, ethereal style for the illustrations.
No commentary, just begin the dream sequence.
Keep going until you've created 4-6 scenes.`

    const result = await chat.sendMessage(prompt + "\n\n" + additionalInstructions)
    const response = await result.response

    const slides: Array<{ text: string; imageData: string }> = []
    let currentText = ''
    let currentImage: string | null = null

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.text) {
        currentText += part.text
      } else if ('inlineData' in part && part.inlineData?.data) {
        currentImage = part.inlineData.data
      }

      if (currentText && currentImage) {
        slides.push({
          text: currentText.trim(),
          imageData: currentImage
        })
        currentText = ''
        currentImage = null
      }
    }

    if (slides.length === 0) {
      throw new Error("No dream scenes were generated")
    }

    return slides
  } catch (error) {
    console.error("Error generating dream sequence:", error)
    throw new Error("Failed to generate dream sequence. Please try again.")
  }
}
