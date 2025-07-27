// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import type { employeesTable, incidenceCategoriesTable, incidencesTable } from "$lib/server/db/schema";


declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
	type EmployeeId = number
	type CategoryId = number

	type Incidence = typeof incidencesTable.$inferSelect;
	
	type Employee = typeof employeesTable.$inferSelect;
	type Employees = Map<EmployeeId, Employee>

	type IncidenceCategory = typeof incidenceCategoriesTable.$inferSelect;
	type IncidenceCategories = Map<CategoryId, IncidenceCategory>
}

export {};
