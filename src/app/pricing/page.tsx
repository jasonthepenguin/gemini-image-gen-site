import React from 'react';

export default function PricingPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6 text-center">Pricing</h1>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Free Tier */}
        <div className="border rounded-lg shadow p-6 flex flex-col">
          <h2 className="text-2xl font-semibold mb-4">Free Tier</h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            Get started for free with:
          </p>
          <ul className="mb-6 space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300">
            <li>1 free credit upon sign up</li>
            <li>Downloadable generations</li>
            <li>For each generation, you get 3 free redos</li>
          </ul>
          <div className="mt-auto">
            <span className="inline-block px-4 py-2 rounded bg-green-100 text-green-800 font-medium">
              Free
            </span>
          </div>
        </div>

        {/* Paid Credits */}
        <div className="border rounded-lg shadow p-6 flex flex-col">
          <h2 className="text-2xl font-semibold mb-4">Paid Credits</h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            Purchase credits for more generations:
          </p>
          <ul className="mb-6 space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300">
            <li><b>$1 USD</b> for <b>5 credits</b></li>
            <li>Each credit allows <b>one generation</b></li>
            <li>
              For each generation, you can upload up to <b>5 images</b> to use as input (combine up to 5 images for your output)
            </li>
            <li>For each generation, you get 3 free redos</li>
            <li>Downloadable generations</li>
            <li>
              Credits can be purchased from the <b>"Create"</b> page
            </li>
          </ul>
          <div className="mt-auto">
            <span className="inline-block px-4 py-2 rounded bg-blue-100 text-blue-800 font-medium">
              Buy Credits on Create Page
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
