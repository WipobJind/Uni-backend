import { getClientPromise } from "@/lib/mongodb";

export async function ensureIndexes() {
  const client = await getClientPromise();
  const db = client.db("unipath");

  // TODO: Create MongoDB indexes for optimal query performance
  //
  // Step 1: Get the "user" collection from the database
  //         - Create a unique index on { username: 1 }
  //         - Create a unique index on { email: 1 }
  //
  // Step 2: Get the "course" collection from the database
  //         - Create an index on { userId: 1 } for filtering courses by user
  //         - Create a unique compound index on { userId: 1, courseCode: 1 }
  //           so each user can only have one course with a given code
  //
  // Step 3: Get the "event" collection from the database
  //         - Create an index on { userId: 1 } for filtering events by user
  //         - Create an index on { courseId: 1 } for filtering events by course
  //         - Create a compound index on { userId: 1, date: 1 } for date-sorted queries
}
