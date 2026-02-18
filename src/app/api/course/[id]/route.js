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
  const user = verifyJWT(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: corsHeaders });
  const { id } = await params;
  const data = await req.json();
  const partialUpdate = {};

  if (data.courseCode != null) partialUpdate.courseCode = data.courseCode;
  if (data.title != null) partialUpdate.title = data.title;
  if (data.credits != null) partialUpdate.credits = Number(data.credits);
  if (data.status != null) partialUpdate.status = data.status;
  if (data.grade != null) partialUpdate.grade = data.grade;
  if (data.semester != null) partialUpdate.semester = data.semester;
  if (data.year != null) partialUpdate.year = data.year;

  if (Object.keys(partialUpdate).length === 0) {
    return NextResponse.json({ message: "No valid fields" }, { status: 400, headers: corsHeaders });
  }

  try {
    const client = await getClientPromise();
    const db = client.db("unipath");
    const existing = await db.collection("course").findOne({ _id: new ObjectId(id), userId: new ObjectId(user.id) });
    if (!existing) return NextResponse.json({ message: "Course not found" }, { status: 404, headers: corsHeaders });

    const result = await db.collection("course").updateOne({ _id: new ObjectId(id), userId: new ObjectId(user.id) }, { $set: partialUpdate });
    return NextResponse.json(result, { status: 200, headers: corsHeaders });
  } catch (exception) {
    return NextResponse.json({ message: exception.toString() }, { status: 400, headers: corsHeaders });
  }
}

export async function DELETE(req, { params }) {
  const user = verifyJWT(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: corsHeaders });
  const { id } = await params;

  try {
    const client = await getClientPromise();
    const db = client.db("unipath");
    const result = await db.collection("course").deleteOne({ _id: new ObjectId(id), userId: new ObjectId(user.id) });
    if (result.deletedCount === 0) return NextResponse.json({ message: "Course not found" }, { status: 404, headers: corsHeaders });

    // Also delete related events
    await db.collection("event").deleteMany({ courseId: new ObjectId(id), userId: new ObjectId(user.id) });
    return NextResponse.json({ message: "Course and related events deleted" }, { status: 200, headers: corsHeaders });
  } catch (exception) {
    return NextResponse.json({ message: exception.toString() }, { status: 400, headers: corsHeaders });
  }
}