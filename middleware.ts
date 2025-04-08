// middleware.ts
export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/create', '/api/:path*'], // explicitly protect '/create' and all api routes
};