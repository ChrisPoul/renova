import { db } from '$lib/server/db/index';
import { incidencesTable } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function PATCH({ request }) {
    const body = await request.json();
    const { id, amount, unit, unitMonetaryValue } = body;

    if (!id || typeof amount !== 'number') {
        return json({ error: 'Missing or invalid fields' }, { status: 400 });
    }

    await db
        .update(incidencesTable)
        .set({
            amount,
            unit,
            unitMonetaryValue
        })
        .where(eq(incidencesTable.id, id))
        .run();

    return json({ success: true });
}