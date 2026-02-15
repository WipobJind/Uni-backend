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

  try {
    const client = await getClientPromise();
    const db = client.db("unipath");
    const result = await db.collection("course").find({ userId: new ObjectId(user.id) }).toArray();
    return NextResponse.json(result, { headers });
  } catch (exception) {
    return NextResponse.json({ message: exception.toString() }, { status: 400, headers: corsHeaders });
  }
}

export async function POST(req) {
  const user = verifyJWT(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: corsHeaders });

  const data = await req.json();
  const { courseCode, title, credits, status, grade, semester, year } = data;

  if (!courseCode || !title) {
    return NextResponse.json({ message: "Missing courseCode or title" }, { status: 400, headers: corsHeaders });
  }

  const validStatuses = ["Planned", "In-Progress", "Completed"];
  const courseStatus = validStatuses.includes(status) ? status : "Planned";
  const validGrades = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F", ""];
  const courseGrade = validGrades.includes(grade) ? grade : "";

  try {
    const client = await getClientPromise();
    const db = client.db("unipath");
    const result = await db.collection("course").insertOne({
      userId: new ObjectId(user.id), courseCode, title,
      credits: Number(credits) || 3, status: courseStatus, grade: courseGrade,
      semester: semester || "", year: year || new Date().getFullYear(), createdAt: new Date(),
    });
    return NextResponse.json({ id: result.insertedId }, { status: 200, headers: corsHeaders });
  } catch (exception) {
    let msg = "Failed to create course";
    if (exception.toString().includes("duplicate")) msg = "You already have a course with this code!";
    return NextResponse.json({ message: msg }, { status: 400, headers: corsHeaders });
  }
}