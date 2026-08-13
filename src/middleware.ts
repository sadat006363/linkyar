import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // همه‌ی درخواست‌ها را بدون محدودیت عبور بده
  return NextResponse.next();
}

export const config = {
  matcher: [], // هیچ مسیری را بررسی نکن
};