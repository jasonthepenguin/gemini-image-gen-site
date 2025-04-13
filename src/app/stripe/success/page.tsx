// src/app/stripe/success/page.tsx

"use client";

import { useSearchParams } from 'next/navigation';

export default function StripeSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
      <p className="mb-2">Thank you for your purchase.</p>
      {sessionId && (
        <p className="text-sm text-gray-500">Session ID: {sessionId}</p>
      )}
      <a href="/create" className="mt-6 text-blue-600 underline">
        Go back to Create page
      </a>
    </main>
  );
}