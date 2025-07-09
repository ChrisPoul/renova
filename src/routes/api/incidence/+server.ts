import { db } from '$lib/server/db/index';
import { incidencesTable } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function POST({ request }) {
	const body = await request.json();
	const { weekId, category, employee, amount } = body;

	await db.insert(incidencesTable).values({ weekId, category, employee, amount });

	return json({ success: true });
}

export async function PATCH({ request }) {
	const body = await request.json();
	const { id, changes } = body;

	await db.update(incidencesTable).set(changes).where(eq(incidencesTable.id, id)).run();

	return json({ success: true });
}
