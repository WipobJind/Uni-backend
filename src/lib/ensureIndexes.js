import { getClientPromise } from "@/lib/mongodb";

export async function ensureIndexes() {
  const client = await getClientPromise();
  const db = client.db("unipath");

  const userCollection = db.collection("user");
  await userCollection.createIndex({ username: 1 }, { unique: true });
  await userCollection.createIndex({ email: 1 }, { unique: true });

  const courseCollection = db.collection("course");
  await courseCollection.createIndex({ userId: 1 });
  await courseCollection.createIndex({ userId: 1, courseCode: 1 }, { unique: true });

  const eventCollection = db.collection("event");
  await eventCollection.createIndex({ userId: 1 });
  await eventCollection.createIndex({ courseId: 1 });
  await eventCollection.createIndex({ userId: 1, date: 1 });
}
