import { GoogleGenAI, Part, GenerateContentResponse } from '@google/genai';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions"; // Adjust path if needed
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimiter";
import { initRedoCounter, canRedo, useRedo } from "@/lib/redoLimiter";
import crypto from "crypto";

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

// Refund credit function
async function refundCredit(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: 1 } },
    });
    console.log(`Refund 1 credit to user ${userId}`);
  } catch (refundError) {
    console.error(`Failed to refund credit to user ${userId}:`, refundError);
  }
}

export async function POST(request: Request) {
  // 1. Check authentication and credits
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
      console.log("Unauthorized attempt to generate.");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  // --- Rate Limiting ---
  const rate = await rateLimit({ key: userId, window: 60, limit: 5 }); // 5 requests per minute per user
  if (!rate.success) {
    return NextResponse.json(
      { error: `Rate limit exceeded. Try again in ${rate.reset} seconds.` },
      { status: 429 }
    );
  }

  let creditDeducted = false; // Track if credit was actually deducted

  try {
    // 2. Get image data and redo info from the request
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const isRedo = formData.get('isRedo') === 'true';
    const generationId = formData.get('generationId') as string | undefined;

    // --- Redo logic ---
    if (isRedo) {
      if (!generationId) {
        return NextResponse.json({ error: 'Missing generationId for redo.' }, { status: 400 });
      }
      // Check if user can redo
      const allowed = await canRedo(userId, generationId);
      if (!allowed) {
        return NextResponse.json({ error: 'Redo limit reached for this generation.' }, { status: 403 });
      }
      // Decrement redo counter
      await useRedo(userId, generationId);
      // Do NOT deduct credit for redo
    } else {
      // --- Credit Check and Deduction (only for new generations) ---
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true },
      });

      if (!user || user.credits <= 0) {
        console.log(`User ${userId} has insufficient credits (${user?.credits ?? 0}).`);
        return NextResponse.json({ error: 'Insufficient credits.' }, { status: 402 }); // 402 Payment Required
      }

      // Attempt to decrement credits
      const updatedUser = await prisma.user.update({
          where: {
              id: userId,
              credits: { gt: 0 } // Ensure credits > 0 during update to prevent race conditions
          },
          data: {
              credits: {
                  decrement: 1
              }
          },
          select: { id: true, credits: true } // Select updated credits
      });

      if (!updatedUser) {
           console.log(`User ${userId} credit decrement failed (race condition or already 0).`);
           return NextResponse.json({ error: 'Insufficient credits.' }, { status: 402 });
      }
      creditDeducted = true; // Set flag after successful deduction
      console.log(`User ${userId} credit deducted. Remaining credits: ${updatedUser.credits}`);
      // --- End Credit Check ---
    }

    // 3. Prepare image data for Gemini
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded.' }, { status: 400 });
    }
    if (files.length > 5) {
        return NextResponse.json({ error: 'Maximum 5 files allowed.' }, { status: 400 });
    }
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      return NextResponse.json({ error: 'Only image files are allowed.'}, { status: 400});
    }
    const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      return NextResponse.json(
        { error: 'Each image must be less than 5MB.' },
        { status: 400 }
      );
    }
    const imageParts = await Promise.all(
      files.map(fileToGenerativePart)
    );

    // 4. Call Gemini API
    const prompt = "Create a blended face by combining these reference images.";
    const contents: Part[] = [
        { text: prompt },
        ...imageParts
    ];

    console.log(`Sending request to Gemini for user ${userId}...`);
    const response: GenerateContentResponse = await genAI.models.generateContent({
        model: "gemini-2.0-flash-exp-image-generation",
        contents: contents,
        config: {
            responseModalities: ["Text", "Image"],
        },
    });

    console.log(`Received response from Gemini for user ${userId}.`);

    // 5. Process response
    const firstImagePart = response.candidates?.[0]?.content?.parts?.find((part: Part) => part.inlineData);

    if (!firstImagePart || !firstImagePart.inlineData) {
        console.error("Gemini API response did not contain image data:", JSON.stringify(response, null, 2));
        const textPart = response.candidates?.[0]?.content?.parts?.find((part: Part) => part.text);
        const errorMessage = textPart?.text
           ? `Image generation failed. Model response: ${textPart.text}`
           : 'Image generation failed or no image returned.';

        if (creditDeducted) {
          await refundCredit(userId);
        }
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    const generatedImageData = firstImagePart.inlineData.data;
    const mimeType = firstImagePart.inlineData.mimeType;

    // Optional: Log successful generation
    // await prisma.generation.create({ data: { userId: userId, cost: 1 }});

    // 6. Return response
    console.log(`Returning generated image data for user ${userId}.`);
    // For new generations, create a new generationId and init redo counter
    let responseGenerationId = generationId;
    if (!isRedo) {
      responseGenerationId = crypto.randomUUID();
      await initRedoCounter(userId, responseGenerationId);
    }
    return NextResponse.json({ imageUrl: `data:${mimeType};base64,${generatedImageData}`, generationId: responseGenerationId });

  } catch (error: unknown) {
    if (creditDeducted) {
      await refundCredit(userId);
    }
    if (error instanceof Error) {
      console.error(`Error in generate API for user ${userId}:`, error.message);
      const message = error.message || 'Internal Server Error';
      return NextResponse.json({ error: message }, { status: 500 });
    } else {
      console.error(`Unknown error in generate API for user ${userId}:`, error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
} 