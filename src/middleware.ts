import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// export async function middleware(request: NextRequest, response: NextResponse) {
//   const session = request.cookies.get('session');

//   //Return to /login if don't have a session
//   if (!session) {
//     console.log('No session');
//     return NextResponse.redirect(new URL('/login', request.url));
//   }

//   //Call the authentication endpoint
//   const responseAPI = await fetch('/api/login', {
//     headers: {
//       Cookie: `session=${session?.value}`,
//     },
//   });

//   //Return to /login if token is not authorized
//   if (responseAPI.status !== 200) {
//     console.log('Not authorized');
//     return NextResponse.redirect(new URL('/login', request.url));
//   }

//   return NextResponse.next();
// }

// //Add your protected routes
// export const config = {
//   matcher: ['/dashboard'],
// };

export async function middleware(request: NextRequest, response: NextResponse) {
  return NextResponse.next();
}

export const config = {
  // place holder for now
  middleware: true,
};
