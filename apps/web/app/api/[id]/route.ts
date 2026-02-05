
import { getDb, todos } from "@repo/db";
import { eq } from 'drizzle-orm'
import { NextResponse } from "next/server";


const db = getDb();



export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const id=Number(params.id);

    const updateData: {
      text?: string;
      done?: boolean;
      date?: Date;
      endDate?: Date;
    } = {};

    if (body.text !== undefined) updateData.text = body.text;
    if (body.done !== undefined) updateData.done = body.done;
    if (body.date !== undefined) updateData.date = new Date(body.date);
    if (body.endDate !== undefined) updateData.endDate = new Date(body.endDate);

    const [todo] = await db
      .update(todos)
      .set(updateData)
      .where(eq(todos.id,id))
      .returning();

    if (!todo) {
      return NextResponse.json(
        { success: false, message: "Todo not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: todo,
    });

  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Update failed" },
      { status: 500 }
    );
  }
}

export async function PUT(req:Request,{params}:{params:{id:string}}){
    try {
        const body=await req.json();
        const id=Number(params.id);
       const updateData: {
    text?: string
    done?: boolean
    date?: Date
    endDate?: Date
  } = {}
  

  if (body.text !== undefined) updateData.text = body.text
  if (body.done !== undefined) updateData.done = body.done
  if (body.date !== undefined) updateData.date = new Date(body.date)
  if (body.endDate !== undefined) updateData.endDate = new Date(body.endDate)
        const updated=await db.update(todos).set(updateData)
        .where(eq(todos.id,id))
        .returning();
        if (updated.length===0){
            return NextResponse.json({error:"To do not found "},{status :404});

        }
        return NextResponse.json({
            success:true,
            data:updated[0]
        });
    }catch (err){
        return NextResponse.json({error:"Update failed"},{status :500});
    }

        }


export async function DELETE(req:Request,{params}:{params:{id:string}}){
    try{
        const id=Number(params.id);
        const result=await db.delete(todos).where(eq(todos.id,id));
        if (result.rowCount===0){
            return NextResponse.json({error:"To do not found "},{status :404});
    }
    return NextResponse.json({success:true,message:"To do deleted"});
}
catch (err){
    return NextResponse.json({error:"Delete failed"},{status :500});
}
}