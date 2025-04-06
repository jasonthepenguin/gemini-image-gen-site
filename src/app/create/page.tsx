'use client'; // Required for using state and event handlers

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function CreatePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null); // URL or base64 data URL
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      // Convert FileList to Array and update state
      // Limit to 5 files on the frontend as well
      const selectedFiles = Array.from(event.target.files).slice(0, 5);
      setFiles(selectedFiles);
      setGeneratedImage(null); // Clear previous image on new selection
      setError(null); // Clear previous error

      if (event.target.files.length > 5) {
          setError("You can select a maximum of 5 images.");
      }
    }
  };

  const handleGenerate = async () => {
    if (files.length === 0) {
      setError('Please upload at least one image.');
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
        // Headers are not needed for FormData with fetch; browser sets Content-Type correctly
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle errors from the API route
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      if (result.imageUrl) {
        setGeneratedImage(result.imageUrl); // Set the base64 data URL
      } else {
        // Should be caught by !response.ok, but good to have a fallback
        throw new Error('Generation succeeded but no image URL was returned.');
      }

    } catch (err: any) {
      console.error('Error calling generate API:', err);
      setError(err.message || 'Failed to generate image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-10 pt-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-800 dark:via-purple-900 dark:to-pink-900">
      <div className="container mx-auto max-w-2xl text-center space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
          Create Your Future Partner Image
        </h1>
        <p className="text-md text-gray-600 dark:text-gray-300">
          Upload 1-5 images of people you admire (with their permission!). Our AI will blend them into a unique vision.
        </p>

        {/* Added Image */}
        <div className="flex justify-center my-6"> {/* Added margin top/bottom */}
           <Image
             src="/images/girl_sunset.png" // Path relative to the public directory
             alt="Example image for generation"
             width={300} // Adjust width as desired
             height={200} // Adjust height for aspect ratio
             className="rounded-lg shadow-md object-cover"
           />
         </div>

        {/* File Input */}
        <div className="flex flex-col items-center space-y-4">
           <label htmlFor="file-upload" className="cursor-pointer bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
             {files.length > 0 ? `${files.length} file(s) selected (Max 5)` : 'Select Images (1-5)'}
           </label>
           <input
             id="file-upload"
             type="file"
             multiple // Allow multiple files
             accept="image/*" // Accept only image files
             onChange={handleFileChange}
             className="hidden" // Hide the default input appearance
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
          disabled={isLoading || files.length === 0}
          className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Generating...' : 'Generate Image'}
        </Button>

        {/* Error Message */}
        {error && <p className="text-red-500 dark:text-red-400 mt-4">{error}</p>} {/* Added margin top */}

        {/* Result Display */}
        {isLoading && (
          <div className="mt-8 text-gray-600 dark:text-gray-300">Processing your images with AI...</div>
        )}

        {generatedImage && !isLoading && (
          <div className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Your Generated Image:</h2>
            <div className="flex justify-center">
              <Image
                src={generatedImage} // Use the base64 data URL from state
                alt="Generated AI partner image"
                width={400} // Adjust as needed
                height={400} // Adjust as needed
                className="rounded-lg shadow-xl object-cover"
              />
            </div>
             {/* Optional: Add download or share buttons here */}
          </div>
        )}
      </div>
    </main>
  );
}
