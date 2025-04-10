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
          </ul>
          <div className="mt-auto">
            <span className="inline-block px-4 py-2 rounded bg-green-100 text-green-800 font-medium">
              Free
            </span>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="border rounded-lg shadow p-6 flex flex-col justify-center items-center">
          <h2 className="text-2xl font-semibold mb-4">More Options Coming Soon</h2>
          <p className="text-gray-700 dark:text-gray-300 text-center">
            We are working on adding purchasable credits and premium features.
            Stay tuned!
          </p>
          <span className="mt-4 inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium">
            Work in Progress 🚧
          </span>
        </div>
      </div>
    </main>
  );
}
