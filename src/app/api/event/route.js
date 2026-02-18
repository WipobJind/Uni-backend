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
  const user = verifyJWT(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: corsHeaders });

  const { title, date, type, courseId, isCompleted } = await req.json();

  if (!title || !date) {
    return NextResponse.json({ message: "Missing title or date" }, { status: 400, headers: corsHeaders });
  }

  const validTypes = ["Exam", "Assignment", "Study", "Other"];
  const eventType = validTypes.includes(type) ? type : "Other";

  try {
    const client = await getClientPromise();
    const db = client.db("unipath");

    if (courseId) {
      const course = await db.collection("course").findOne({ _id: new ObjectId(courseId), userId: new ObjectId(user.id) });
      if (!course) return NextResponse.json({ message: "Course not found" }, { status: 404, headers: corsHeaders });
    }

    const result = await db.collection("event").insertOne({
      userId: new ObjectId(user.id), title, date: new Date(date), type: eventType,
      courseId: courseId ? new ObjectId(courseId) : null, isCompleted: isCompleted || false, createdAt: new Date(),
    });
    return NextResponse.json({ id: result.insertedId }, { status: 200, headers: corsHeaders });
  } catch (exception) {
    return NextResponse.json({ message: exception.toString() }, { status: 400, headers: corsHeaders });
  }
}