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
	type parentCategory = 'destajo' | 'bono' | 'deduccion'
	type categoryType = 'deduccion' | 'percepcion';
	interface CategoriaIncidencia {
		id: number;
		concept: string;
		type: categoryType;
		parentCategory: parentCategory;
		unit: string;
		unitMonetaryValue: number;
	}
	interface Incidencia {
		id: number;
		category: number;
		amount: number;
	}
	interface Employee {
		id: number;
		name: string;
		incidencias: Incidencia[];
		salary: number
	}
}

export {};
