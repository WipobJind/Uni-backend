import { verifyJWT } from "@/lib/auth";
import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

const gradePoints = { "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0, "C-": 1.7, "D+": 1.3, "D": 1.0, "F": 0.0 };

export async function OPTIONS(req) {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function GET(req) {
  const user = verifyJWT(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: corsHeaders });

  try {
    const client = await getClientPromise();
    const db = client.db("unipath");
    const courses = await db.collection("course").find({ userId: new ObjectId(user.id) }).toArray();

    // TODO: Calculate GPA and course statistics from the courses array
    //
    // Step 1: Initialize tracking variables:
    //         - totalPoints = 0 (sum of grade points × credits)
    //         - totalCredits = 0 (credits of graded completed courses)
    //         - completedCredits = 0 (credits of all completed courses)
    //         - totalPlannedCredits = 0 (credits of all courses regardless of status)
    //         - statusCounts = { Planned: 0, "In-Progress": 0, Completed: 0 }
    //
    // Step 2: Loop through each course and:
    //         - Get the course credits (default to 3 if not set)
    //         - Add credits to totalPlannedCredits
    //         - Increment the matching statusCounts[course.status] entry
    //         - If course.status is "Completed":
    //           - Add credits to completedCredits
    //           - If the course has a valid grade (exists in gradePoints map):
    //             - Add (gradePoints[course.grade] × credits) to totalPoints
    //             - Add credits to totalCredits
    //
    // Step 3: Calculate GPA:
    //         - If totalCredits > 0: gpa = (totalPoints / totalCredits).toFixed(2)
    //         - Otherwise: gpa = "N/A"

    // TODO: Fetch upcoming events for the next 7 days
    //
    // Step 1: Create a Date object for "now" and another for "nextWeek" (now + 7 days)
    //         Use nextWeek.setDate(nextWeek.getDate() + 7)
    //
    // Step 2: Query the "event" collection for events where:
    //         - userId matches the current user (new ObjectId(user.id))
    //         - date is between now and nextWeek: { $gte: now, $lte: nextWeek }
    //         - isCompleted is false
    //         Sort by date ascending (.sort({ date: 1 })), limit to 10 results (.limit(10))
    //         Convert to array with .toArray()

    // TODO: Fetch user profile and return the dashboard response
    //
    // Step 1: Get the user profile from the "user" collection using findOne({ email: user.email })
    //         Exclude the password field: { projection: { password: 0 } }
    //
    // Step 2: Return a JSON response using NextResponse.json() containing:
    //         {
    //           gpa,
    //           totalCourses: courses.length,
    //           completedCredits,
    //           totalPlannedCredits,
    //           progressPercent: totalPlannedCredits > 0 ? Math.round((completedCredits / totalPlannedCredits) * 100) : 0,
    //           statusCounts,
    //           targetGPA: profile?.targetGPA || 4.0,
    //           upcomingEvents
    //         }
    //         Include corsHeaders in the response options

  } catch (exception) {
    return NextResponse.json({ message: exception.toString() }, { status: 500, headers: corsHeaders });
  }
}
