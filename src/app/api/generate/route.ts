import { GoogleGenAI, Part, GenerateContentResponse } from '@google/genai';
import { NextResponse } from 'next/server';

// Initialize the Google Generative AI client
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE' });

// Helper function to convert File to Gemini Part
async function fileToGenerativePart(file: File): Promise<Part> {
  const base64EncodedDataPromise = file.arrayBuffer().then(bytes => Buffer.from(bytes).toString('base64'));
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
}

export async function POST(request: Request) {
  try {
    // 1. Get image data from the request
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    console.log('API route hit, files received:', files.length);

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded.' }, { status: 400 });
    }

    // Limit the number of files (e.g., to 5 as suggested in frontend)
    if (files.length > 5) {
        return NextResponse.json({ error: 'Maximum 5 files allowed.' }, { status: 400 });
    }

    // 2. Prepare image data for Gemini
    const imageParts = await Promise.all(
      files.map(fileToGenerativePart)
    );

    // 3. Call Gemini API
    const prompt = "Create a blended image from these references. Only output the final blended image, no other text or commentary.";
    const contents: Part[] = [
        { text: prompt },
        ...imageParts
    ];

    console.log("Sending request to Gemini...");
    // Add back config with responseModalities
    const response: GenerateContentResponse = await genAI.models.generateContent({
        model: "gemini-2.0-flash-exp-image-generation",
        contents: contents,
        config: {
            responseModalities: ["Text", "Image"], // Request BOTH Text and Image modalities
        },
    });

    console.log("Received response from Gemini.");

    // 4. Process response
    const firstImagePart = response.candidates?.[0]?.content?.parts?.find((part: Part) => part.inlineData);

    if (!firstImagePart || !firstImagePart.inlineData) {
        console.error("Gemini API response did not contain image data:", JSON.stringify(response, null, 2));
        // Access response.text
        const text = response.text; 
        const errorMessage = text ? `Image generation failed. Model response: ${text}` : 'Image generation failed or no image returned.';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    const generatedImageData = firstImagePart.inlineData.data;
    const mimeType = firstImagePart.inlineData.mimeType;

    // 5. Return response
    console.log("Returning generated image data.");
    return NextResponse.json({ imageUrl: `data:${mimeType};base64,${generatedImageData}` });

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in generate API:', error.message);
      const message = error.message || 'Internal Server Error';
      return NextResponse.json({ error: message }, { status: 500 });
    } else {
      console.error('Unknown error in generate API:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
} 