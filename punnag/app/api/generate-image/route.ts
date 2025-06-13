import { NextResponse } from 'next/server';
import { PredictionServiceClient, helpers, protos } from '@google-cloud/aiplatform';
type IValue = protos.google.protobuf.IValue; // Alias IValue if needed

// TODO: Update with your project ID and desired location
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || '968195322013'; // Ensure this env var is set
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
const MODEL_ID = 'imagen-3.0-generate-002'; // Or the specific Imagen model you want

// Initialize the Vertex AI Prediction Service Client
const clientOptions = {
  apiEndpoint: `${LOCATION}-aiplatform.googleapis.com`,
};
const predictionServiceClient = new PredictionServiceClient(clientOptions);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, negativePrompt, aspectRatio = '1:1', sampleCount = 1 } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
      console.warn('GOOGLE_CLOUD_PROJECT_ID environment variable not set. Using default value.');
      // Consider throwing an error or using a default project ID carefully
    }

    console.log(`Generating image with prompt: "${prompt}"`);

    // Construct the API request payload
    const endpoint = `projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_ID}`;

    const promptPayload = { prompt };
    const instanceValue = helpers.toValue(promptPayload) as IValue; // Use imported IValue
    const instances = [instanceValue];

    const parameter: { [key: string]: any } = {
      sampleCount: sampleCount,
      aspectRatio: aspectRatio,
      // Add other parameters as needed, checking Imagen API docs
      // e.g., seed, safetyFilterLevel, personGeneration
    };
    if (negativePrompt) {
      parameter.negativePrompt = negativePrompt;
    }
    const parameters = helpers.toValue(parameter);

    const apiRequest = {
      endpoint,
      instances,
      parameters,
    };

    // Make the prediction request to Vertex AI
    const predictCallResult = await predictionServiceClient.predict(apiRequest);
    const response = predictCallResult[0];

    if (!response || !response.predictions || response.predictions.length === 0) {
      return NextResponse.json({ error: 'Image generation failed, no predictions returned.' }, { status: 500 });
    }

    // Extract the base64 encoded image data
    const predictions = response.predictions;
    const imageDatas = predictions.map((prediction: any) => {
      const base64 = prediction?.structValue?.fields?.bytesBase64Encoded?.stringValue;
      if (!base64) {
        console.error("Prediction missing bytesBase64Encoded:", prediction);
        return null;
      }
      // You might want to get mimeType from response if available, otherwise assume png
      return { base64Data: base64, mimeType: 'image/png' }; // Adjust mimeType if needed
    }).filter(Boolean); // Filter out any nulls from failed extractions

    if (imageDatas.length === 0) {
        return NextResponse.json({ error: 'Image generation failed, could not extract image data.' }, { status: 500 });
    }

    console.log(`Successfully generated ${imageDatas.length} image(s).`);

    // Return the full array of image data
    return NextResponse.json({ images: imageDatas });

  } catch (error) {
    console.error('Error calling Vertex AI Imagen API:', error);
    // Extract more specific error details if possible
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: 'Failed to generate image', details: errorMessage }, { status: 500 });
  }
} 