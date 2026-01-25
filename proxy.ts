// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = [ '/sign-in', '/forgot-password', '/reset-password', '/signup', '/sign-up'];
const ONBOARDING_ROUTE = '/onboarding';

async function decryptToken(token: string): Promise<any> {
  try {
    const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
    if (!key || key.length !== 64) return null;

    const parts = token.split(':');
    if (parts.length !== 3) return null;

    const [ivHex, authTagHex, ciphertextHex] = parts;
    
    // Convert hex to bytes
    const hexToBytes = (hex: string): Uint8Array => {
      const bytes = new Uint8Array(hex.length / 2);
      for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
      }
      return bytes;
    };

    // Convert key from hex
    const keyBytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      keyBytes[i] = parseInt(key.substr(i * 2, 2), 16);
    }

    const iv:any = hexToBytes(ivHex);
    const authTag = hexToBytes(authTagHex);
    const ciphertext = hexToBytes(ciphertextHex);

    // Combine ciphertext and authTag
    const combined = new Uint8Array(ciphertext.length + authTag.length);
    combined.set(ciphertext);
    combined.set(authTag, ciphertext.length);

    // Import key
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes.buffer,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv.buffer, tagLength: 128 },
      cryptoKey,
      combined.buffer
    );

    const decoder = new TextDecoder();
    const decryptedText = decoder.decode(decrypted);
    return JSON.parse(decryptedText);
  } catch (error) {
    console.error('Token decryption failed:', error);
    return null;
  }
}

async function parseJWT(token: string): Promise<any> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode base64url
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const payload = JSON.parse(jsonPayload);
    
    // Check expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }
    
    // Decrypt the data field if it exists
    if (payload.data) {
      const decryptedData = await decryptToken(payload.data);
      return decryptedData;
    }
    
    return payload;
  } catch (error) {
    console.error('JWT parsing failed:', error);
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  
  // Get token from cookie or Authorization header
  const token = request.cookies.get('accessToken')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  // Redirect root to sign-in if not authenticated
  if (pathname === '/' && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users from root to dashboard
  if (pathname === '/' && token) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }
  
  // Redirect authenticated users away from public routes
  if (isPublicRoute && token) {
    const payload = await parseJWT(token);
    
    if (payload) {
      const url = request.nextUrl.clone();
      
      // Check onboarding status
      if (payload.onboardingCompleted === false) {
        url.pathname = '/onboarding';
      } else {
        url.pathname = '/dashboard';
      }
      
      return NextResponse.redirect(url);
    }
  }
  
  // Allow public routes for unauthenticated users
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Require authentication for protected routes
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    return NextResponse.redirect(url);
  }

  // Parse and validate JWT
  const payload = await parseJWT(token);
  
  if (!payload) {
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    return NextResponse.redirect(url);
  }

  // Check onboarding status
  const onboardingCompleted = payload.onboardingCompleted;

  // Redirect to onboarding if not completed
  if (!onboardingCompleted && pathname !== ONBOARDING_ROUTE) {
    const url = request.nextUrl.clone();
    url.pathname = ONBOARDING_ROUTE;
    return NextResponse.redirect(url);
  }

  // Redirect away from onboarding if already completed
  if (onboardingCompleted && pathname === ONBOARDING_ROUTE) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
};