import { VertexAI, Part } from '@google-cloud/vertexai';
import { NextRequest, NextResponse } from 'next/server';

// Vertex AI Configuration
const PROJECT_ID = 'distributed-inn-457713-p1'; // Corrected Google Cloud Project ID
const LOCATION = 'us-central1';   // Your Google Cloud Location (e.g., us-central1)

// Initialize Vertex AI
const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });

const model = 'gemini-2.0-flash-exp'; // Switch back to a Gemini Pro model for multimodal

// Prepare the generative model instance
const generativeModel = vertexAI.getGenerativeModel({
    model: model,
    // generationConfig: { // generationConfig might not be needed directly here for streaming multimodal
    //     responseMimeType: "text/plain",
    // },
    // safetySettings: [], // Adjust safety settings if needed
});

const additionalInstructions = `
Use a fun story about lots of computers as a metaphor.
Keep sentences short but conversational, casual, and engaging.
For each sentence, provide a cute, minimal illustration as inline base64 encoded PNG data.
Example format: [Sentence Text][Inline PNG Data]
No commentary or extra text, just begin your explanation.
Keep going until you're done.`;

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const fullPrompt: Part[] = [
        { text: `${prompt}\n${additionalInstructions}` }
        // If sending images in prompt, add { inlineData: { mimeType: ..., data: ... }} parts here
    ];

    const result = await generativeModel.generateContentStream({ contents: [{ role: 'user', parts: fullPrompt }] });

    // Create a ReadableStream to process the Vertex AI response
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const item of result.stream) {
            if (item.candidates && item.candidates.length > 0) {
              const candidate = item.candidates[0];
              if (candidate.content && candidate.content.parts) {
                for (const part of candidate.content.parts) {
                  if (part.text) {
                    // Just send the raw text chunk
                    controller.enqueue(`data: ${JSON.stringify({ type: 'text', data: part.text })}\n\n`);
                  } else if (part.inlineData?.data && part.inlineData?.mimeType) {
                    // Fallback: Still handle correctly formatted inlineData if it ever appears
                    controller.enqueue(`data: ${JSON.stringify({ type: 'image', data: part.inlineData.data, mimeType: part.inlineData.mimeType })}\n\n`);
                  }
                }
              }
            }
          }
          controller.close();
        } catch (error) {
          console.error('Error processing Vertex AI stream:', error);
          controller.enqueue(`data: ${JSON.stringify({ type: 'error', data: 'Error processing Vertex AI stream' })}\n\n`);
          controller.close();
        }
      }
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('Error in Vertex AI generate-comic API:', error);
    const errorMessage = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message;
    return NextResponse.json({ error: `Failed to generate comic: ${errorMessage}` }, { status: 500 });
  }
}

// export const runtime = 'edge'; // Vertex AI SDK might not be fully compatible with Edge Runtime 