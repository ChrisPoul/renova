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
	type CategoryType = 'destajo' | 'bono' | 'deduccion';
	interface IncidenceCategory {
		id: number;
		concept: string;
		type: CategoryType;
		unit: string;
		unitMonetaryValue: number;
	}
	interface Incidence {
		id: number;
		category: number;
		amount: number;
		unitMonetaryValue?: number;
		unit?: string;
	}
	interface Employee {
		id: number;
		name: string;
		salary: number;
		puesto: string;
		area: string;
		incidencias: Incidence[];
	}
}

export {};
