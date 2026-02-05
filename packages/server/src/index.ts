
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { getDb, todos } from "@repo/db";
import { eq } from 'drizzle-orm'

const app = new Hono().basePath("/api")
app.use('*', logger())


// app.use(
//   cors({
//     origin: ['https://supabase-my-app-iota.vercel.app', 'http://localhost:3000',],
//     allowHeaders: ['Content-Type', 'Authorization','Access-Control-Allow-Origin'],
//     allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//   })
// )

const db = getDb();


app.get('/test', (c) => c.json({ ok: true }))


app.get('/', async (c) => {
  const data = await db.select().from(todos)
  return c.json(data)
})


app.post('/', async (c) => {
  const body = await c.req.json()

  const [todo] = await db
    .insert(todos)
    .values({
      text: body.text,
      done: body.done,
      date: new Date(body.date),
      endDate: new Date(body.endDate),
    })
    .returning()

  return c.json({ success: true, data: todo }, 201)
})


app.put('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const body = await c.req.json()

  const [todo] = await db
    .update(todos)
    .set({
      text: body.text,
      done: body.done,
      date: new Date(body.date),
      endDate: new Date(body.endDate),
    })
    .where(eq(todos.id, id))
    .returning()

  if (!todo) {
    return c.json({ success: false, message: 'Todo not found' }, 404)
  }

  return c.json({ success: true, data: todo })
})


app.patch('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const body = await c.req.json()

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

  const [todo] = await db
    .update(todos)
    .set(updateData)
    .where(eq(todos.id, id))
    .returning()

  if (!todo) {
    return c.json({ success: false, message: 'Todo not found' }, 404)
  }

  return c.json({ success: true, data: todo })
})

app.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'))

  const result = await db.delete(todos).where(eq(todos.id, id))

  if (result.rowCount === 0) {
    return c.json({ success: false, message: 'Todo not found' }, 404)
  }

  return c.json({ success: true, message: 'Todo deleted' })
})


// serve({
//   fetch: app.fetch,
//   port: 4000,
// });

// console.log("Server running on http://localhost:4000");
export { app}