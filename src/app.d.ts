// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
	interface IncidenceCategory {
		id: number;
		concept: string;
		type: string;
		unit: string;
		unitMonetaryValue: number;
		unitValueIsDerived: boolean;
	}
	type Incidence = typeof import('$lib/server/db/schema').incidencesTable.$inferSelect;
	interface Employee {
		id: number;
		name: string;
		salary: number;
		puesto: string;
		area: string;
		incidences: Incidence[];
	}
}

export {};
