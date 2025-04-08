// src/components/Navbar.tsx

'use client'; // Navbar now needs client-side hooks

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react'; // Import hooks
import { Button } from './ui/button'; // Assuming you might want button styling

export function Navbar() {
  const { data: session, status } = useSession(); // Get session status

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 shadow-md">
      {/* Left side: Logo/Brand */}
      <div className="text-lg font-bold">
        <Link href="/">FutureLove ❤️</Link>
      </div>

      {/* Right side: Navigation Links */}
      <div className="flex items-center space-x-4"> {/* Added items-center */}
        <Link href="/" className="hover:text-blue-500">Home</Link>
        <Link href="/pricing" className="hover:text-blue-500">Pricing</Link>
        <Link href="/explore" className="hover:text-blue-500">Explore</Link>
        {/* Conditionally render Create link if authenticated */}
        {status === 'authenticated' && (
           <Link href="/create" className="hover:text-blue-500">Create</Link>
        )}
        <Link href="/faq" className="hover:text-blue-500">FAQ</Link>

        {/* Auth Button */}
        {status === 'loading' && (
            <span className="text-sm text-gray-500">Loading...</span>
        )}
        {status === 'unauthenticated' && (
          <Button variant="outline" size="sm" onClick={() => signIn('google', { callbackUrl: '/create' })}>
            Login
          </Button>
        )}
        {status === 'authenticated' && (
           <>
             {/* Optional: Show user info */}
             <span className="text-sm hidden md:inline"> {/* Hide on small screens */}
               {session.user?.name || session.user?.email}
             </span>
             <Button variant="outline" size="sm" onClick={() => signOut()}>
               Logout
             </Button>
           </>
        )}
      </div>
    </nav>
  );
}
