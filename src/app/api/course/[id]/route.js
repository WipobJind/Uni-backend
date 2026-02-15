import { verifyJWT } from "@/lib/auth";
import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function OPTIONS(req) {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function GET(req, { params }) {
  const user = verifyJWT(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: corsHeaders });
  const { id } = await params;

  try {
    const client = await getClientPromise();
    const db = client.db("unipath");
    const result = await db.collection("course").findOne({ _id: new ObjectId(id), userId: new ObjectId(user.id) });
    if (!result) return NextResponse.json({ message: "Course not found" }, { status: 404, headers: corsHeaders });
    return NextResponse.json(result, { headers: corsHeaders });
  } catch (exception) {
    return NextResponse.json({ message: exception.toString() }, { status: 400, headers: corsHeaders });
  }
}

export async function PATCH(req, { params }) {
  // TODO: Implement course update endpoint
  //
  // Step 1: Verify JWT using verifyJWT(req). Return 401 if unauthorized.
  //         Extract the course { id } from await params
  //         Parse the request body with await req.json()
  //
  // Step 2: Build a partialUpdate object from the provided fields:
  //         Allowed fields: courseCode, title, credits (convert to Number), status, grade, semester, year
  //         For each field, check if data.fieldName != null before adding to partialUpdate
  //
  // Step 3: If no valid fields provided (empty partialUpdate), return 400 with message "No valid fields"
  //
  // Step 4: Connect to MongoDB using getClientPromise(), get the "unipath" database
  //         First, verify the course exists and belongs to the user:
  //         findOne({ _id: new ObjectId(id), userId: new ObjectId(user.id) })
  //         If not found, return 404 with message "Course not found"
  //
  // Step 5: Use updateOne() to apply { $set: partialUpdate } to the matching course
  //         Return the result with status 200 and corsHeaders
  //         Wrap in try-catch, return 400 on errors
}

export async function DELETE(req, { params }) {
  // TODO: Implement course deletion endpoint
  //
  // Step 1: Verify JWT using verifyJWT(req). Return 401 if unauthorized.
  //         Extract the course { id } from await params
  //
  // Step 2: Connect to MongoDB using getClientPromise(), get the "unipath" database
  //         Use deleteOne() to delete the course matching:
  //         { _id: new ObjectId(id), userId: new ObjectId(user.id) }
  //
  // Step 3: If result.deletedCount === 0, return 404 with message "Course not found"
  //
  // Step 4: IMPORTANT — Also delete all related events for this course!
  //         Use deleteMany() on the "event" collection where:
  //         { courseId: new ObjectId(id), userId: new ObjectId(user.id) }
  //
  // Step 5: Return success response with message "Course and related events deleted" (status 200)
  //         Wrap in try-catch, return 400 on errors
}
