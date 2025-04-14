'use client'; // Required for using state and event handlers

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';



export default function CreatePage() {
  const { data: session, status, update: updateSession } = useSession();
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null); // URL or base64 data URL
  const [error, setError] = useState<string | null>(null);
  const [agreedToDisclaimer, setAgreedToDisclaimer] = useState(false);



  useEffect(() => {
    console.log("Session data:", session);
  }, [session]);

  const MAX_FILE_SIZE_MB = 5;
  const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files).slice(0, 5);

      // Validate file types
      const invalidFiles = selectedFiles.filter(
        (file) => !file.type.startsWith('image/')
      );
      if (invalidFiles.length > 0) {
        setError('Only image files are allowed.');
        setFiles([]);
        setGeneratedImage(null);
        return;
      }

      // Validate file sizes
      const oversizedFiles = selectedFiles.filter(
        (file) => file.size > MAX_FILE_SIZE
      );
      if (oversizedFiles.length > 0) {
        setError(`Each image must be less than ${MAX_FILE_SIZE_MB}MB.`);
        setFiles([]);
        setGeneratedImage(null);
        return;
      }

      setFiles(selectedFiles);
      setGeneratedImage(null);
      setError(null);

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
      window.location.href = data.url; 
    } else {
      alert(data.error || "Failed to start checkout");
    }
  }

  if (status === 'unauthenticated') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-800 dark:via-purple-900 dark:to-pink-900">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-10 max-w-md w-full flex flex-col items-center space-y-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col items-center space-y-2">
            <span className="text-4xl">🔒</span>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Sign in Required</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-center">
            To access the <span className="font-semibold text-blue-600 dark:text-blue-300">Create</span> page, please log in with your Google account.
          </p>
          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
            onClick={() => signIn('google', { callbackUrl: '/create'})}
          >
            <span className="mr-2"> {/* Google "G" icon SVG */}
              <svg width="20" height="20" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.1 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.5l6.4-6.4C34.1 6.5 29.3 4.5 24 4.5 12.7 4.5 3.5 13.7 3.5 25S12.7 45.5 24 45.5c10.5 0 20-8.5 20-20 0-1.3-.1-2.7-.5-4z"/><path fill="#34A853" d="M6.3 14.7l7 5.1C15.5 16.1 19.4 13.5 24 13.5c2.7 0 5.2.9 7.2 2.5l6.4-6.4C34.1 6.5 29.3 4.5 24 4.5c-7.2 0-13.3 4.1-16.7 10.2z"/><path fill="#FBBC05" d="M24 45.5c5.7 0 10.5-1.9 14.1-5.1l-6.5-5.3c-2 1.4-4.5 2.2-7.6 2.2-6.1 0-11.2-4.1-13-9.6l-7 5.4C6.7 41.1 14.7 45.5 24 45.5z"/><path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-1.1 3.1-4.1 5.5-7.7 5.5-2.2 0-4.2-.7-5.7-2l-7 5.4C18.7 41.1 24 45.5 24 45.5c10.5 0 20-8.5 20-20 0-1.3-.1-2.7-.5-4z"/></g></svg>
            </span>
            Login with Google
          </Button>
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            We&apos;ll never post or share anything without your permission.
          </p>
        </div>
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

        {/* Disclaimer Checkbox */}
        <div className="flex items-start space-x-3 mt-6 p-4 rounded-lg border border-yellow-400 bg-yellow-50 dark:bg-yellow-900/30">
          <span className="text-2xl mt-0.5">⚠️</span>
          <div>
            <label htmlFor="disclaimer" className="text-sm text-gray-800 dark:text-gray-100 font-medium">
              <input
                type="checkbox"
                id="disclaimer"
                checked={agreedToDisclaimer}
                onChange={(e) => setAgreedToDisclaimer(e.target.checked)}
                className="mr-2 accent-yellow-500"
              />
              By checking this box, you confirm that you have obtained explicit consent from all individuals in the uploaded images. You are solely responsible for your uploads and use of generated images. FutureLove is not liable for misuse.
            </label>
          </div>
        </div>

        {/* Generate Button */}
        <Button
          size="lg"
          onClick={handleGenerate}
          disabled={isLoading || files.length < 2 || credits === 0 || !agreedToDisclaimer}
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
