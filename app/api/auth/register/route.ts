import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Add detailed logging for debugging
    console.log("Registration request received");
    
    let requestBody;
    try {
      requestBody = await request.json();
      console.log("Request body parsed successfully:", { 
        hasEmail: !!requestBody.email, 
        hasPassword: !!requestBody.password, 
        hasUsername: !!requestBody.username 
      });
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON format in request body" },
        { status: 400 }
      );
    }

    const { email, password, username, profilePicture } = requestBody;

    if (!email || !password || !username) {
      console.log("Missing required fields:", { email: !!email, password: !!password, username: !!username });
      return NextResponse.json(
        { error: "Email, password, and username are required" },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters long" },
        { status: 400 }
      );
    }

    // Validate username format (only lowercase letters, numbers, underscores)
    if (!/^[a-z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: "Username can only contain lowercase letters, numbers, and underscores" },
        { status: 400 }
      );
    }

    console.log("Attempting database connection...");
    await connectToDatabase();
    console.log("Database connected successfully");

    // Check if email already exists
    console.log("Checking for existing email...");
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("Email already exists:", email);
      return NextResponse.json(
        { error: "User already registered with this email" },
        { status: 400 }
      );
    }

    // Check if username already exists
    console.log("Checking for existing username...");
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      console.log("Username already exists:", username);
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 400 }
      );
    }

    console.log("Creating new user...");
    await User.create({
      email,
      password,
      username,
      profilePicture: profilePicture || undefined,
    });

    console.log("User created successfully:", username);
    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 200 }
    );
  } catch (error) {
    const errorObj = error as Error;
    console.error("Registration error details:", {
      message: errorObj.message || 'Unknown error',
      stack: errorObj.stack || 'No stack trace',
      name: errorObj.name || 'Unknown error type'
    });
    
    // Return more specific error messages based on error type
    if (errorObj.name === 'ValidationError') {
      return NextResponse.json(
        { error: "Validation failed: " + (errorObj.message || 'Invalid data') },
        { status: 400 }
      );
    }
    
    if (errorObj.name === 'MongoError' || errorObj.name === 'MongoServerError') {
      return NextResponse.json(
        { error: "Database error occurred" },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}