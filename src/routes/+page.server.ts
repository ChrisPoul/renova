import { db } from '$lib/server/db';
import {
	getAllEmployeesWithIncidences,
	getAllIncidenceCategories,
	makeDummyData
} from '$lib/server/db/index';
import { weeksTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function load({ url }) {
	const weekId = url.searchParams.get('weekId');

	let [employees, incidenceCategories, weeks] = await Promise.all([
		getAllEmployeesWithIncidences(weekId),
		getAllIncidenceCategories(weekId),
		db.select().from(weeksTable)
	]);

	if (weeks.length === 0) {
		await makeDummyData();
		// Re-fetch data after inserting dummy data
		[employees, incidenceCategories, weeks] = await Promise.all([
			getAllEmployeesWithIncidences(weekId),
			getAllIncidenceCategories(weekId),
			db.select().from(weeksTable)
		]);
	}

	const selectedWeekId = weekId ? parseInt(weekId, 10) : weeks[0]?.id;

	const selectedWeek = await db.query.weeksTable.findFirst({
		where: eq(weeksTable.id, selectedWeekId)
	});

	return { employees, incidenceCategories, selectedWeek };
}
