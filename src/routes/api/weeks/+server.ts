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
			orderBy: desc(weeksTable.startDate),
			with: {
				incidences: true,
				employeesToWeeks: {
					with: {
						employee: true
					}
				},
				categoriesToWeeks: {
					with: {
						category: true
					}
				}
			}
		});

		const [newWeek] = await tx.insert(weeksTable).values({ startDate, endDate }).returning();

		if (lastWeek) {
			if (lastWeek.categoriesToWeeks.length > 0) {
				const categoriesToInsert = lastWeek.categoriesToWeeks.map((category) => ({
					...category,
					id: undefined,
					weekId: newWeek.id
				}));
				await tx.insert(categoriesToWeeksTable).values(categoriesToInsert);
			}

			if (lastWeek.employeesToWeeks.length > 0) {
				const employeesToInsert = lastWeek.employeesToWeeks.map((employee) => ({
					...employee,
					id: undefined,
					weekId: newWeek.id
				}));
				await tx.insert(employeesToWeeksTable).values(employeesToInsert);
			}

			if (lastWeek.incidences.length > 0) {
				const incidencesToInsert = lastWeek.incidences.map((incidence) => ({
					...incidence,
					id: undefined,
					weekId: newWeek.id
				}));
				await tx.insert(incidencesTable).values(incidencesToInsert);
			}
		}

		return newWeek;
	});

	return json({ weekId: newWeek.id });
}
