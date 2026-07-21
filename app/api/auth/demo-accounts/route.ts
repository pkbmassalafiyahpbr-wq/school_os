import { NextResponse } from 'next/server'
import { authService } from '@/services'

export async function GET() {
  return NextResponse.json(authService.getDemoAccounts())
}
