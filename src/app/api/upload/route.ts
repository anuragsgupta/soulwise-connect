// /app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
const ALLOWED_AUDIO_TYPES = [
  "audio/mpeg", 
  "audio/mp3", 
  "audio/wav", 
  "audio/webm", 
  "audio/webm;codecs=opus",
  "audio/ogg", 
  "audio/ogg;codecs=opus",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a"
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string; // 'image' or 'audio'

    console.log('Upload request:', { 
      hasFile: !!file, 
      type, 
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type 
    });

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = type === "audio" ? ALLOWED_AUDIO_TYPES : ALLOWED_IMAGE_TYPES;
    const fileType = file.type.split(';')[0]; // Remove codecs part for comparison
    const isValidType = allowedTypes.some(allowedType => 
      fileType === allowedType || allowedType.startsWith(fileType)
    );
    
    if (!isValidType) {
      console.error('Invalid file type:', { fileType, allowedTypes });
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Allowed types: ${allowedTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public", "uploads", type === "audio" ? "audio" : "images");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const originalExtension = file.name.split(".").pop() || 'webm';
    const fileExtension = type === "audio" && !['mp3', 'wav', 'webm', 'ogg', 'm4a'].includes(originalExtension.toLowerCase())
      ? 'webm'
      : originalExtension;
    const filename = `${timestamp}-${randomString}.${fileExtension}`;
    const filepath = path.join(uploadDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return public URL
    const publicUrl = `/uploads/${type === "audio" ? "audio" : "images"}/${filename}`;

    console.log('File saved successfully:', { 
      filepath, 
      publicUrl,
      bufferSize: buffer.length 
    });

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: filename,
      size: file.size,
      type: file.type,
    });

  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file", details: error.message },
      { status: 500 }
    );
  }
}

// Optional: DELETE endpoint to remove uploaded files
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get("url");

    if (!fileUrl) {
      return NextResponse.json(
        { error: "No file URL provided" },
        { status: 400 }
      );
    }

    // Extract filename from URL
    const filename = fileUrl.split("/").pop();
    if (!filename) {
      return NextResponse.json(
        { error: "Invalid file URL" },
        { status: 400 }
      );
    }

    // Determine if it's an image or audio file
    const isAudio = fileUrl.includes("/uploads/audio/");
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      isAudio ? "audio" : "images"
    );
    const filepath = path.join(uploadDir, filename);

    // Delete file if it exists
    if (existsSync(filepath)) {
      const { unlink } = await import("fs/promises");
      await unlink(filepath);
      return NextResponse.json({ success: true, message: "File deleted" });
    } else {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

  } catch (error: any) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete file", details: error.message },
      { status: 500 }
    );
  }
}
