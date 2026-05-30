import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params
  const validPlatforms = ['android', 'ios', 'web']

  if (!validPlatforms.includes(platform.toLowerCase())) {
    return NextResponse.json(
      { error: 'Invalid platform. Supported: android, ios, web' },
      { status: 400 }
    )
  }

  const host = request.headers.get('host') || 'localhost:3000'
  const protocol = request.headers.get('x-forwarded-proto') || 'https'
  const appUrl = `${protocol}://${host}`

  const platformInfo: Record<string, {
    platform: string
    installType: string
    appUrl: string
    instructions: string[]
  }> = {
    android: {
      platform: 'android',
      installType: 'pwa',
      appUrl,
      instructions: [
        'Open this URL in Chrome browser',
        'Tap the three-dot menu (⋮) in the top right',
        'Select "Add to Home Screen" or "Install app"',
        'Tap "Install" to confirm',
        'The app will appear on your home screen'
      ]
    },
    ios: {
      platform: 'ios',
      installType: 'pwa',
      appUrl,
      instructions: [
        'Open this URL in Safari browser',
        'Tap the Share button (⬆️) at the bottom',
        'Scroll down and tap "Add to Home Screen"',
        'Tap "Add" to confirm',
        'The app will appear on your home screen'
      ]
    },
    web: {
      platform: 'web',
      installType: 'pwa',
      appUrl,
      instructions: [
        'Click the install icon in the browser address bar',
        'Or click "Install" when prompted',
        'The app will open as a standalone window'
      ]
    }
  }

  const info = platformInfo[platform.toLowerCase()]
  return NextResponse.json(info)
}
