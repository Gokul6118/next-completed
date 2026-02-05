
import { getDb, todos } from "@repo/db";
import { NextResponse } from "next/server";


const db = getDb();

export async function GET() {
  const data = await db.select().from(todos)
  return NextResponse.json({data},{status:200});
}


export async function POST(req: Request) {
    const body= await req.json()

    const [todo] = await db
      .insert(todos)
      .values({
        text: body.text,
        done: body.done,
        date: new Date(body.date),
        endDate: new Date(body.endDate),
      })
      .returning()
      return NextResponse.json({todo }, {status: 201})
    
}




// serve({
//   fetch: app.fetch,
//   port: 4000,
// });

// console.log("Server running on http://localhost:4000");
