import { type NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "clube.sid";
const LOGIN = "/";
const HOME = "/home";
const VERIFY = "/verify-credentials";

export async function proxy({ nextUrl, cookies }: NextRequest) {
  const hasSession = cookies.has(COOKIE_NAME);
  const pathname = nextUrl.pathname;
  const isPublic = pathname === LOGIN || pathname === VERIFY;
  const sessionExpired = nextUrl.searchParams.get("session") === "expired";

  if (!hasSession && !isPublic) {
    const url = nextUrl.clone();
    url.pathname = LOGIN;
    return NextResponse.redirect(url);
  }

  if (hasSession && !sessionExpired && pathname === LOGIN) {
    const url = nextUrl.clone();
    url.pathname = HOME;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
