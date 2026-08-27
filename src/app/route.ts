import fs from "node:fs";
import path from "node:path";

// Serves the actual Ganzy design export (public/ganzy.html) at the root URL,
// bypassing React entirely so the shipped app is the real design file —
// not a reinterpretation of it.
export async function GET() {
  const filePath = path.join(process.cwd(), "public", "ganzy.html");
  const html = fs.readFileSync(filePath, "utf-8");
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
