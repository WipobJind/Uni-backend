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
  // TODO: Implement profile update endpoint
  //
  // Step 1: Verify the JWT token using verifyJWT(req)
  //         If null, return 401 "Unauthorized" response with corsHeaders
  //
  // Step 2: Parse the request body using await req.json()
  //
  // Step 3: Build a partialUpdate object with only the fields that are provided (not null):
  //         Allowed fields: firstname, lastname, major, enrollmentYear, targetGPA
  //         Check each field: if (data.fieldName != null) partialUpdate.fieldName = data.fieldName
  //
  // Step 4: If partialUpdate has no keys (Object.keys(partialUpdate).length === 0),
  //         return 400 response with message "No valid fields to update"
  //
  // Step 5: Connect to MongoDB using getClientPromise(), get the "unipath" database
  //         Use updateOne() on the "user" collection to update the user matching { email: user.email }
  //         Apply the update using { $set: partialUpdate }
  //
  // Step 6: Return the update result with status 200 and corsHeaders
  //         Wrap in try-catch, return 500 with error message on errors
}
