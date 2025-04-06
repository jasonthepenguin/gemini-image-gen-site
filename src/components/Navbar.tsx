// src/components/Navbar.tsx


import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 shadow-md">
      {/* Left side: Logo/Brand */}
      <div className="text-lg font-bold">
        <Link href="/">FutureLove ❤️</Link>
      </div>

      {/* Right side: Navigation Links */}
      <div className="flex space-x-4">
        <Link href="/" className="hover:text-blue-500">Home</Link>
        <Link href="/pricing" className="hover:text-blue-500">Pricing</Link>
        <Link href="/explore" className="hover:text-blue-500">Explore</Link>
        <Link href="/faq" className="hover:text-blue-500">FAQ</Link>
        <Link href="/login" className="hover:text-blue-500">Login</Link>
      </div>
    </nav>
  );
}
