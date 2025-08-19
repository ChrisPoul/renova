import { db } from '$lib/server/db';
import {
	weeksTable,
	categoriesToWeeksTable,
	employeesToWeeksTable,
	incidencesTable,
	categoriesTable,
	employeesTable
} from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { desc, eq, lt } from 'drizzle-orm';
import { getWeekFromDate } from '$lib/utils.js';
import { copyWeek } from '$lib/server/db/weeks';

export async function POST({ request }) {
	const { date } = await request.json();

	const { startDate, endDate } = getWeekFromDate(date);

	const existingWeek = await db
		.select()
		.from(weeksTable)
		.where(eq(weeksTable.startDate, startDate));

	if (existingWeek.length > 0) {
		return json({ weekId: existingWeek[0].id });
	}

	const newWeek = await db.transaction(async (tx) => {
		const lastWeek = await tx.query.weeksTable.findFirst({
			where: lt(weeksTable.startDate, startDate),
			orderBy: desc(weeksTable.startDate)
		});

		const [newWeek] = await tx.insert(weeksTable).values({ startDate, endDate }).returning();

		if (lastWeek) {
			await copyWeek(lastWeek.id, newWeek.id);
		}

		return newWeek;
	});

	return json({ weekId: newWeek.id });
}
