import { db } from '$lib/server/db/index';
import { incidencesTable } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function PATCH({ request }) {
	const body = await request.json();
	const { id, changes } = body;


	await db
		.update(incidencesTable)
		.set(changes)
		.where(eq(incidencesTable.id, id))
		.run();

	return json({ success: true });
}
