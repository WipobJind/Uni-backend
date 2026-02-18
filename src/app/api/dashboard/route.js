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

    let totalPoints = 0, totalCredits = 0, completedCredits = 0, totalPlannedCredits = 0;
    const statusCounts = { Planned: 0, "In-Progress": 0, Completed: 0 };

    courses.forEach((course) => {
      const credits = course.credits || 3;
      totalPlannedCredits += credits;
      if (statusCounts[course.status] !== undefined) statusCounts[course.status]++;
      if (course.status === "Completed") {
        completedCredits += credits;
        if (course.grade && gradePoints[course.grade] !== undefined) {
          totalPoints += gradePoints[course.grade] * credits;
          totalCredits += credits;
        }
      }
    });

    const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "N/A";

    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcomingEvents = await db.collection("event").find({
      userId: new ObjectId(user.id), date: { $gte: now, $lte: nextWeek }, isCompleted: false,
    }).sort({ date: 1 }).limit(10).toArray();

    const profile = await db.collection("user").findOne({ email: user.email }, { projection: { password: 0 } });

    return NextResponse.json({
      gpa, totalCourses: courses.length, completedCredits, totalPlannedCredits,
      progressPercent: totalPlannedCredits > 0 ? Math.round((completedCredits / totalPlannedCredits) * 100) : 0,
      statusCounts, targetGPA: profile?.targetGPA || 4.0, upcomingEvents,
    }, { headers: corsHeaders });
  } catch (exception) {
    return NextResponse.json({ message: exception.toString() }, { status: 500, headers: corsHeaders });
  }
}
