export default function FAQPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Frequently Asked Questions</h1>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">What is FutureLove?</h2>
          <p className="text-gray-700 dark:text-gray-300">
            FutureLove is an AI-powered platform that generates unique partner images using Google&apos;s Gemini image generation technology.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">How does the image generation work?</h2>
          <p className="text-gray-700 dark:text-gray-300">
            We use Google&apos;s Gemini model to create AI-generated images based on your inputs. The technology blends reference photos and prompts to produce unique results.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Is my data safe?</h2>
          <p className="text-gray-700 dark:text-gray-300">
            We do not store your uploaded images permanently. Image generation is handled by Google&apos;s Gemini API, and data usage is subject to Google&apos;s privacy policies.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Who built this?</h2>
          <p className="text-gray-700 dark:text-gray-300">
            FutureLove was created by Jason and Angel, two friends passionate about AI and creative technology.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Can I use the generated images commercially?</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Please review Google&apos;s Gemini API terms of service regarding commercial use. We recommend using generated images for personal and non-commercial purposes unless otherwise permitted.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Will there be more features?</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Yes! We&apos;re actively working on new features, including more customization options, purchasable credits, and a community gallery.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">How does FutureLove handle my data?</h2>
          <p className="text-gray-700 dark:text-gray-300">
            We use your uploaded images only for generating your AI partner image. Images are not stored permanently and are processed securely via Google&apos;s Gemini API. Your personal information is used only for authentication and credit management.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Will my images be shared or used for other purposes?</h2>
          <p className="text-gray-700 dark:text-gray-300">
            No. Your images are never shared or used for any purpose other than generating your requested image. We do not use your data for advertising or sell it to third parties.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">What is your refund policy?</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Credits are generally non-refundable, but if you experience a technical issue, please contact us and we&apos;ll review your request. You can reach out via <a href="https://x.com/JasonBotterill3" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@JasonBotterill3 on X (Twitter)</a>.
          </p>
        </div>
      </div>
    </main>
  );
}
