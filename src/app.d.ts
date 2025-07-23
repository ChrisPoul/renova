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
	interface Incidence {
		id: number;
		category: number;
		employee: number;
		amount: number;
		basedOnCategory: boolean;
		unitMonetaryValue: number;
		unit: string;
		unitValueIsDerived: boolean;
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
