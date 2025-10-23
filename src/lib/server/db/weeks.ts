import { db } from '$lib/server/db';
import {
	weeksTable,
	categoriesToWeeksTable,
	employeesToWeeksTable,
	incidencesTable,
	categoriesTable,
	employeesTable
} from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function copyWeek(
	fromWeekId: number,
	toWeekId: number,
	deleteExistingData = false,
	tx?: any
) {
	const fromWeek = await db.query.weeksTable.findFirst({
		where: eq(weeksTable.id, fromWeekId),
		with: {
			incidences: true,
			employeesToWeeks: true,
			categoriesToWeeks: true
		}
	});

	if (!fromWeek) {
		return;
	}

	// Usar la transacción existente si se proporciona, o crear una nueva
	const dbInstance = tx || db;

	if (deleteExistingData) {
		await dbInstance.delete(incidencesTable).where(eq(incidencesTable.weekId, toWeekId));
		await dbInstance.delete(employeesToWeeksTable).where(eq(employeesToWeeksTable.weekId, toWeekId));
		await dbInstance.delete(categoriesToWeeksTable).where(eq(categoriesToWeeksTable.weekId, toWeekId));
	}

	if (fromWeek.categoriesToWeeks.length > 0) {
		const categoriesToInsert = fromWeek.categoriesToWeeks.map((category) => ({
			...category,
			id: undefined,
			weekId: toWeekId
		}));
		await dbInstance.insert(categoriesToWeeksTable).values(categoriesToInsert);
	}

	if (fromWeek.employeesToWeeks.length > 0) {
		const employeesToInsert = fromWeek.employeesToWeeks.map((employee) => ({
			...employee,
			id: undefined,
			weekId: toWeekId
		}));
		await dbInstance.insert(employeesToWeeksTable).values(employeesToInsert);
	}

	if (fromWeek.incidences.length > 0) {
		const incidencesToInsert = fromWeek.incidences.map((incidence) => ({
			...incidence,
			id: undefined,
			weekId: toWeekId
		}));
		await dbInstance.insert(incidencesTable).values(incidencesToInsert);
	}
}
