import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return that custom API keys are not supported - use environment variable
    return NextResponse.json({
      hasCustomKey: false,
      apiKey: null,
      message: "Custom API keys are configured via environment variables"
    });
  } catch (error) {
    console.error("Get API key error:", error);
    return NextResponse.json(
      { error: "Failed to fetch API key" },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { error: "Custom API key storage is not supported. Please use environment variables." },
    { status: 400 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Custom API key storage is not supported. Please use environment variables." },
    { status: 400 }
  );
}
