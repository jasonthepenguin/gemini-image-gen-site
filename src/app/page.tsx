import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-10 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-800 dark:via-purple-900 dark:to-pink-900">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Column: Text Content */}
        <div className="text-center md:text-left space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white">
            AI Image Partner Creator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Upload images of your crushes{' '}
            <strong className="text-red-500">*WITH EXPLICIT PERMISSION*</strong>{' '}
            and see what your future AI crush looks like!
          </p>
          {/* Optional: Add a call-to-action button here */}
          <div className="pt-4">
             <Link href="/create">
               <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300">Get Started</Button>
             </Link>
          </div>
        </div>

        {/* Right Column: Image */}
        <div className="flex justify-center">
          <Image
            src="/images/faces.png" // Assuming the image is in public/images/
            alt="Faces collage"
            width={500} // Adjust width as needed
            height={750} // Adjust height as needed
            className="rounded-lg shadow-xl object-cover"
            priority // Load image faster as it's above the fold
          />
        </div>
      </div>
    </main>
  );
}