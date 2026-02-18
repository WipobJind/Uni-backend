import { verifyJWT } from "@/lib/auth";
import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function OPTIONS(req) {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function GET(req) {
  const user = verifyJWT(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: corsHeaders });

  try {
    const client = await getClientPromise();
    const db = client.db("unipath");
    const profile = await db.collection("user").findOne({ email: user.email }, { projection: { password: 0 } });
    if (!profile) return NextResponse.json({ message: "User not found" }, { status: 404, headers: corsHeaders });
    return NextResponse.json(profile, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ message: error.toString() }, { status: 500, headers: corsHeaders });
  }
}

export async function PATCH(req) {
  const user = verifyJWT(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: corsHeaders });

  const data = await req.json();
  const partialUpdate = {};
  if (data.firstname != null) partialUpdate.firstname = data.firstname;
  if (data.lastname != null) partialUpdate.lastname = data.lastname;
  if (data.major != null) partialUpdate.major = data.major;
  if (data.enrollmentYear != null) partialUpdate.enrollmentYear = data.enrollmentYear;
  if (data.targetGPA != null) partialUpdate.targetGPA = data.targetGPA;

  if (Object.keys(partialUpdate).length === 0) {
    return NextResponse.json({ message: "No valid fields to update" }, { status: 400, headers: corsHeaders });
  }

  try {
    const client = await getClientPromise();
    const db = client.db("unipath");
    const result = await db.collection("user").updateOne({ email: user.email }, { $set: partialUpdate });
    return NextResponse.json(result, { status: 200, headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ message: error.toString() }, { status: 500, headers: corsHeaders });
  }
}