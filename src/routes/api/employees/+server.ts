import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export async function GET() {
	const employees = await db.query.employeesTable.findMany();
	return json(employees);
}
