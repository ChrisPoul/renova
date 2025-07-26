import { db } from '$lib/server/db';
import {
	weeksTable,
	incidenceCategoriesTable,
	categoriesToWeeksTable,
	employeesTable,
	incidencesTable,
	employeesToWeeksTable
} from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

function getMondayOfISOWeek(year: number, week: number) {
	// Set to the first Thursday of the year
	const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
	const dow = simple.getUTCDay();
	const ISOweekStart = simple;
	if (dow <= 4 && dow !== 0) {
		// Monday to Thursday: back up to Monday
		ISOweekStart.setUTCDate(simple.getUTCDate() - simple.getUTCDay() + 1);
	} else {
		// Friday to Sunday: forward to next Monday
		ISOweekStart.setUTCDate(simple.getUTCDate() + 8 - simple.getUTCDay());
	}
	// Return as local date (remove UTC if you want UTC dates)
	return new Date(
		ISOweekStart.getUTCFullYear(),
		ISOweekStart.getUTCMonth(),
		ISOweekStart.getUTCDate()
	);
}

export async function POST({ request }) {
	const { week } = await request.json();
	const [year, weekNumber] = week.split('-W').map(Number);

	const startDate = getMondayOfISOWeek(year, weekNumber);
	const endDate = new Date(startDate);
	endDate.setDate(endDate.getDate() + 6);

	const existingWeek = await db
		.select()
		.from(weeksTable)
		.where(eq(weeksTable.startDate, startDate));

	if (existingWeek.length > 0) {
		return json({ weekId: existingWeek[0].id });
	}

	const newWeek = await db.transaction(async (tx) => {
		const [newWeek] = await tx.insert(weeksTable).values({ startDate, endDate }).returning();

		const allCategories = await tx
			.select({ id: incidenceCategoriesTable.id })
			.from(incidenceCategoriesTable);
		const allEmployees = await tx.select({ id: employeesTable.id }).from(employeesTable);

		if (allCategories.length > 0) {
			const categoriesToInsert = allCategories.map((category) => ({
				categoryId: category.id,
				weekId: newWeek.id
			}));
			await tx.insert(categoriesToWeeksTable).values(categoriesToInsert);
		}

		if (allEmployees.length > 0) {
			const employeesToInsert = allEmployees.map((employee) => ({
				employeeId: employee.id,
				weekId: newWeek.id
			}));
			await tx.insert(employeesToWeeksTable).values(employeesToInsert);
		}

		if (allEmployees.length > 0 && allCategories.length > 0) {
			const incidencesToInsert = allEmployees.flatMap((employee) =>
				allCategories.map((category) => ({
					employeeId: employee.id,
					categoryId: category.id,
					weekId: newWeek.id,
					amount: 0 // Default amount
				}))
			);
			await tx.insert(incidencesTable).values(incidencesToInsert);
		}

		return newWeek;
	});

	return json({ weekId: newWeek.id });
}
