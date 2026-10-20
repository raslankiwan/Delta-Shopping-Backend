import { database, closeDatabase } from "@delta/database";
import { hashPassword } from "../packages/server/auth";
import { registerSchema } from "@delta/domain";
// Receive credentials via stdin JSON; never put passwords in shell arguments.
let input = "";
for await (const chunk of process.stdin) input += chunk;
const credentials = registerSchema.parse(JSON.parse(input));
const db = await database();
const existing = await db
  .collection("users")
  .findOne({ email: credentials.email });
if (existing)
  throw new Error(
    "Account exists. Use a different email; this script does not overwrite accounts.",
  );
await db
  .collection("users")
  .insertOne({
    email: credentials.email,
    name: credentials.name,
    passwordHash: await hashPassword(credentials.password),
    role: "admin",
    disabled: false,
    createdAt: new Date(),
  });
console.log("Administrator created.");
await closeDatabase();
