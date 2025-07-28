import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export async function GET() {
	const categories = await db.query.categoriesTable.findMany();
	return json(categories);
}
