import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params

  if (platform === 'android') {
    return NextResponse.redirect('https://play.google.com/store/apps/details?id=com.aihrms.mobile')
  }

  if (platform === 'ios') {
    return NextResponse.redirect('https://apps.apple.com/app/ai-hrms/id1234567890')
  }

  return NextResponse.json({ error: 'Invalid platform. Use "android" or "ios".' }, { status: 400 })
}
