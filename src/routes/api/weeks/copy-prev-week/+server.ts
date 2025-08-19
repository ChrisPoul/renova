import { db } from '$lib/server/db';
import { eq, lt } from 'drizzle-orm';
import { weeksTable } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { copyWeek } from '$lib/server/db/weeks';

export async function POST({ request }) {
	const { weekId } = await request.json();

	const currentWeek = await db.query.weeksTable.findFirst({
		where: eq(weeksTable.id, weekId)
	});

	if (!currentWeek) {
		return json({ success: false, message: 'Current week not found' });
	}

	const prevWeek = await db.query.weeksTable.findFirst({
		where: lt(weeksTable.startDate, currentWeek.startDate),
		orderBy: (weeks, { desc }) => [desc(weeks.startDate)]
	});

	if (!prevWeek) {
		return json({ success: false, message: 'Previous week not found' });
	}

	await copyWeek(prevWeek.id, currentWeek.id, true);

	return json({ success: true });
}
