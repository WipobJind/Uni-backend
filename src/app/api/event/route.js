import { verifyJWT } from "@/lib/auth";
import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function OPTIONS(req) {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function GET(req) {
  const user = verifyJWT(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: corsHeaders });

  const headers = { "Cache-Control": "no-store, no-cache, must-revalidate", "Pragma": "no-cache", "Expires": "0", ...corsHeaders };
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");

  try {
    const client = await getClientPromise();
    const db = client.db("unipath");
    const query = { userId: new ObjectId(user.id) };
    if (courseId) query.courseId = new ObjectId(courseId);

    const result = await db.collection("event").find(query).sort({ date: 1 }).toArray();
    return NextResponse.json(result, { headers });
  } catch (exception) {
    return NextResponse.json({ message: exception.toString() }, { status: 400, headers: corsHeaders });
  }
}

export async function POST(req) {
  // TODO: Implement event creation endpoint
  //
  // Step 1: Verify JWT using verifyJWT(req). Return 401 if unauthorized.
  //
  // Step 2: Parse the request body using await req.json()
  //         Destructure { title, date, type, courseId, isCompleted }
  //
  // Step 3: Validate that title and date are provided
  //         If either is missing, return 400 with message "Missing title or date"
  //
  // Step 4: Validate the event type against allowed values: ["Exam", "Assignment", "Study", "Other"]
  //         If the provided type is not in the list, default to "Other"
  //
  // Step 5: Connect to MongoDB using getClientPromise(), get the "unipath" database
  //         If a courseId is provided, verify the course exists and belongs to the user:
  //         findOne({ _id: new ObjectId(courseId), userId: new ObjectId(user.id) })
  //         If the course doesn't exist, return 404 with message "Course not found"
  //
  // Step 6: Insert the new event into the "event" collection with these fields:
  //         - userId: new ObjectId(user.id)
  //         - title: the provided title
  //         - date: new Date(date) — convert the date string to a Date object
  //         - type: the validated event type
  //         - courseId: new ObjectId(courseId) if provided, otherwise null
  //         - isCompleted: provided value or false as default
  //         - createdAt: new Date()
  //
  // Step 7: Return { id: result.insertedId } with status 200 and corsHeaders
  //         Wrap in try-catch, return 400 on errors
}
