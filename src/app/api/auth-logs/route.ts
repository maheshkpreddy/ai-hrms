import { NextResponse } from 'next/server';

// Simple in-memory log storage for debugging
const logs: string[] = [];

export function addLog(msg: string) {
  logs.push(`[${new Date().toISOString()}] ${msg}`);
  if (logs.length > 100) logs.shift();
}

export async function GET() {
  return NextResponse.json({ logs });
}

export async function DELETE() {
  logs.length = 0;
  return NextResponse.json({ cleared: true });
}
