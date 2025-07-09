import { db } from '$lib/server/db';
import { weeksTable } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';

export async function GET() {
  const weeks = await db.select().from(weeksTable);
  return json(weeks);
}

export async function POST({ request }) {
  const { startDate, endDate } = await request.json();
  await db.insert(weeksTable).values({ startDate: new Date(startDate), endDate: new Date(endDate) });
  return new Response(null, { status: 201 });
}
