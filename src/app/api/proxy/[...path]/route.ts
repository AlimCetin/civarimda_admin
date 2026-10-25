import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_BACKEND = 'https://civarimda.onrender.com/api';

async function handleProxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await params;
    const subPath = (path || []).join('/');

    // Get target backend URL from custom header or fallback to default
    let targetBase = req.headers.get('x-target-url') || DEFAULT_BACKEND;
    if (targetBase.includes('civarimda-api')) {
      targetBase = DEFAULT_BACKEND;
    }
    const cleanTargetBase = targetBase.endsWith('/') ? targetBase.slice(0, -1) : targetBase;

    // Preserve query string
    const search = req.nextUrl.search;
    const targetUrl = `${cleanTargetBase}/${subPath}${search}`;

    // Prepare headers for upstream backend
    const upstreamHeaders: Record<string, string> = {
      'Content-Type': req.headers.get('content-type') || 'application/json',
      Accept: 'application/json',
    };

    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      upstreamHeaders['Authorization'] = authHeader;
    }

    // Prepare body if not GET or HEAD
    let body: any = undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      try {
        const text = await req.text();
        if (text) body = text;
      } catch {
        // No body
      }
    }

    const upstreamResponse = await fetch(targetUrl, {
      method: req.method,
      headers: upstreamHeaders,
      body,
      cache: 'no-store',
    });

    const responseData = await upstreamResponse.text();

    return new NextResponse(responseData, {
      status: upstreamResponse.status,
      headers: {
        'Content-Type': upstreamResponse.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error: any) {
    console.error('API Proxy Error:', error);
    return NextResponse.json(
      { message: 'Proxy sunucu hatası: ' + (error.message || 'Hedef API sunucusuna erişilemedi.') },
      { status: 502 }
    );
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const DELETE = handleProxy;
export const PATCH = handleProxy;
export const OPTIONS = handleProxy;
