import jwt from "jsonwebtoken";
import cookie from "cookie";
const JWT_SECRET = process.env.JWT_SECRET || "mydefaultjwtsecret";

export function verifyJWT(req) {
  // TODO: Implement JWT verification
  //
  // Step 1: Get the "cookie" header from the request using req.headers.get("cookie")
  //         If no cookie header exists, default to an empty string ""
  //
  // Step 2: Parse the cookie string using cookie.parse() to extract individual cookies
  //         Destructure the "token" property from the parsed cookies
  //
  // Step 3: If no token is found, return null (user is not authenticated)
  //
  // Step 4: Use jwt.verify(token, JWT_SECRET) to verify and decode the token
  //
  // Step 5: Return the decoded payload (contains user id, email, username)
  //
  // Step 6: Wrap everything in a try-catch block — if verification fails, return null
}
