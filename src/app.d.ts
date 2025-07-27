// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import type { employeesTable, categoriesTable, incidencesTable, weeksTable } from '$lib/server/db/schema';

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
	type EmployeeId = number;
	type CategoryId = number;
	type CategoryType = string

	type Week = typeof weeksTable.$inferSelect;

	type Incidence = typeof incidencesTable.$inferSelect;

	type Employee = typeof employeesTable.$inferSelect;
	type Employees = Map<EmployeeId, Employee>;

	type Category = typeof categoriesTable.$inferSelect;
	type Categories = Map<CategoryId, Category>;
}

export {};
