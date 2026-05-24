import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params

  // Redirect to the mobile app info page
  // The mobile apps are coming soon - redirect users to the download info page
  if (platform === 'android' || platform === 'ios') {
    return NextResponse.redirect(new URL('/mobile-app', request.url))
  }

  return NextResponse.json({ error: 'Invalid platform. Use "android" or "ios".' }, { status: 400 })
}
