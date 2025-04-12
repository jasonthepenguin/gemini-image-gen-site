export default function ExplorePage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6 text-center">Explore</h1>

      <p className="text-center text-gray-700 dark:text-gray-300 mb-10">
        This feature is a work in progress. Soon you&apos;ll be able to browse your past generations and discover creations from other users!
      </p>

      {/* Placeholder grid for future images */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {/* Example placeholder cards */}
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="aspect-square rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500"
          >
            <span>Image #{idx + 1}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
