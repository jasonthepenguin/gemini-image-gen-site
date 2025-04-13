'use client'; // Required for using state and event handlers

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CreatePage() {
  const { data: session, status, update: updateSession } = useSession();
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null); // URL or base64 data URL
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      // Option 1: Redirect to NextAuth default sign-in page
      // signIn('google'); // Or just signIn() to show all providers

      // Option 2: You could show a message and a manual sign-in button instead
      // For this example, we'll rely on the Navbar login button and show a message.
    }
  }, [status]);

  useEffect(() => {
    console.log("Session data:", session);
  }, [session]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      // Convert FileList to Array and update state
      // Limit to 5 files on the frontend as well
      const selectedFiles = Array.from(event.target.files).slice(0, 5);

      // Validate file types
      const invalidFiles = selectedFiles.filter(
        (file) => !file.type.startsWith('image/')
      );
      if (invalidFiles.length > 0)
      {
        setError('Only image files are allowed.');
        setFiles([]);
        setGeneratedImage(null);
        return;
      }

      setFiles(selectedFiles);
      setGeneratedImage(null); // Clear previous image on new selection
      setError(null); // Clear previous error

      if (event.target.files.length > 5) {
          setError("You can select a maximum of 5 images.");
      }
    }
  };

  const handleGenerate = async () => {

    if (files.length < 2) {
      setError("Please upload at least two images.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
         // Handle specific credit error
        if (response.status === 402) {
             setError(result.error || 'You have run out of credits.');
        } else if (response.status === 401) {
            setError('You must be logged in to generate images.');
            // Optionally trigger sign in
            // signIn('google', { callbackUrl: '/create '});
        }
        else {
            // Handle other errors from the API route
            throw new Error(result.error || `HTTP error! status: ${response.status}`);
        }
        // Clear potential image from previous attempts if error occurs
        setGeneratedImage(null);
      } else if (result.imageUrl) {
        setGeneratedImage(result.imageUrl);
        // Refresh session data to get updated credit count
        await updateSession();
      } else {
        throw new Error('Generation succeeded but no image URL was returned.');
      }

    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error calling generate API:', err);
        setError(err.message || 'Failed to generate image. Please try again.');
      } else {
        console.error('Unknown error:', err);
        setError('An unknown error occurred.');
      }
       setGeneratedImage(null); // Clear image on catch
    } finally {
      setIsLoading(false);
    }
  };

  async function handleBuyCredits() {
    // Replace with your Stripe Price ID
    const priceId = "price_1RDOofBGYl8IBiembTIQ9ZYY"; // From the credit product Stripe dashboard

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });

    const data = await res.json();
    if (data.url) {
      const stripe = await stripePromise;
      window.location.href = data.url; 
    } else {
      alert(data.error || "Failed to start checkout");
    }
  }

  if (status === 'unauthenticated') {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-10 text-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-800 dark:via-purple-900 dark:to-pink-900">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="mb-4">You must be logged in to access the Create page.</p>
            <Button onClick={() => signIn('google', { callbackUrl: '/create'})}>Login with Google</Button>
        </main>
    );
  }

  // Get credit count, default to loading state or 0 if unavailable
  const credits = session?.user?.credits;
  const creditsDisplay = credits !== undefined && credits !== null ? credits : '...';

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-10 pt-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-800 dark:via-purple-900 dark:to-pink-900">
      <div className="container mx-auto max-w-2xl text-center space-y-6">
        <div className="flex justify-between items-center w-full px-4 md:px-0">
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Welcome, {session?.user?.name || 'User'}!
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Credits: {creditsDisplay}
            </span>
            <Button
            onClick={handleBuyCredits}
            className="ml-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300"
          >
            Buy More Credits
          </Button>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
          Create Your Future Partner Image
        </h1>
        <p className="text-md text-gray-600 dark:text-gray-300">
          Upload 2-5 images of people you admire (with their permission!). Our AI will blend them into a unique vision. (1 Credit per generation)
        </p>

        {/* Added Image */}
        <div className="flex justify-center my-6">
           <Image
             src="/images/girl_sunset.png"
             alt="Example image for generation"
             width={300}
             height={200}
             className="rounded-lg shadow-md object-cover"
           />
         </div>

        {/* File Input */}
        <div className="flex flex-col items-center space-y-4">
           <label htmlFor="file-upload" className="cursor-pointer bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
             {files.length > 0 ? `${files.length} file(s) selected (Max 5)` : 'Select Images (2-5)'}
           </label>
           <input
             id="file-upload"
             type="file"
             multiple
             accept="image/*"
             onChange={handleFileChange}
             className="hidden"
           />
           {files.length > 0 && (
             <p className="text-sm text-gray-500 dark:text-gray-400">
               Selected: {files.map(f => f.name).join(', ')}
             </p>
           )}
        </div>

        {/* Generate Button */}
        <Button
          size="lg"
          onClick={handleGenerate}
          // Disable if no credits, loading, or no files
          disabled={isLoading || files.length < 2 || credits === 0}
          className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Generating...' : (credits === 0 ? 'Out of Credits' : 'Generate Image (1 Credit)')}
        </Button>

        {/* Error Message */}
        {error && (
          <div className="relative mt-6 px-4 py-3 rounded-lg border border-red-400 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 flex items-start space-x-3">
            <div className="text-xl">⚠️</div>
            <div className="flex-1">{error}</div>
            <button
              onClick={() => setError(null)}
              className="absolute top-1 right-2 text-red-700 dark:text-red-200 hover:text-red-900 dark:hover:text-white font-bold"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        )}

        {/* Result Display */}
        {isLoading && (
          <div className="mt-8 flex flex-col items-center text-gray-600 dark:text-gray-300">
            <Image
              src="/images/beating_heart.gif"
              alt="Loading spinner"
              width={80}
              height={80}
              className="mb-4"
            />
            <p>Generating your image...</p>
          </div>
        )}

        {generatedImage && !isLoading && (
          <div className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Your Generated Image:</h2>
            <div className="flex justify-center">
              <Image
                src={generatedImage}
                alt="Generated AI partner image"
                width={400}
                height={400}
                className="rounded-lg shadow-xl object-cover"
              />
            </div>
            <div className="flex justify-center mt-4">
              <a
                href={generatedImage}
                download="generated_image.png"
                className="inline-block bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                Download Image
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
