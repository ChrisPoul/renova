import {
	getAllEmployeesWithIncidences,
	getAllIncidenceCategories,
	makeDummyData
} from '$lib/server/db/index';

export async function load() {
	let [employees, incidenceCategories] = await Promise.all([
		getAllEmployeesWithIncidences(),
		getAllIncidenceCategories()
	]);
	if (employees.length === 0 || incidenceCategories.length === 0) {
		await makeDummyData();
		// Re-fetch data after inserting dummy data
		[employees, incidenceCategories] = await Promise.all([
			getAllEmployeesWithIncidences(),
			getAllIncidenceCategories()
		]);
	}
	return { employees, incidenceCategories };
}
