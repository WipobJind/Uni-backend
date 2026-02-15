import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "mydefaultjwtsecret";

export async function OPTIONS(req) {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function POST(req) {
  // TODO: Implement the login endpoint
  //
  // Step 1: Parse the request body using await req.json()
  //         Destructure { email, password } from the body
  //
  // Step 2: Validate that both email and password are provided
  //         If either is missing, return a 400 response with message "Missing email or password"
  //
  // Step 3: Connect to MongoDB using getClientPromise() and get the "unipath" database
  //         Look up the user by email in the "user" collection using findOne({ email })
  //
  // Step 4: If no user is found, return a 401 response with message "Invalid email or password"
  //
  // Step 5: Compare the provided password with the stored hash using bcrypt.compare(password, user.password)
  //         If the password doesn't match, return a 401 response with message "Invalid email or password"
  //
  // Step 6: Generate a JWT token using jwt.sign() with payload { id: user._id, email: user.email, username: user.username }
  //         Use JWT_SECRET as the secret and set expiresIn to "7d"
  //
  // Step 7: Create a success response with NextResponse.json({ message: "Login successful" }, { status: 200, headers: corsHeaders })
  //         Set an httpOnly cookie named "token" on the response using response.cookies.set("token", token, { ... })
  //         Cookie options: httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 (7 days in seconds)
  //         Set secure: true only in production (process.env.NODE_ENV === "production")
  //
  // Step 8: Return the response. Wrap everything in try-catch, returning 500 on internal errors
}
