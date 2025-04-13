"use client";


// src/app/stripe/success/page.tsx


export const dynamic = "force-dynamic";



import { Suspense } from "react";
import { useSearchParams } from 'next/navigation';

function StripeSuccessInner() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="bg-white shadow-lg rounded-xl px-8 py-10 flex flex-col items-center max-w-md w-full">
        {/* Success Icon */}
        <div className="mb-6">
          <svg
            className="w-16 h-16 text-green-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="white" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12l2.5 2.5L16 9"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold mb-2 text-green-700">Payment Successful!</h1>
        <p className="mb-2 text-lg text-gray-700">Thank you for your purchase.</p>
        {sessionId && (
          <p className="text-xs text-gray-400 mb-4">Session ID: {sessionId}</p>
        )}
        <a
          href="/create"
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Go back to Create page
        </a>
      </div>
    </main>
  );
}

export default function StripeSuccessPage() {
  return (
    <Suspense>
      <StripeSuccessInner />
    </Suspense>
  );
}