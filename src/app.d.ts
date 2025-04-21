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
	interface CategoriaDestajo {
		id: number;
		concept: string;
		unit: string;
		unitMonetaryValue: number;
	}
	interface Destajo {
		id: number;
		category: number;
		amount: number;
	}
	interface Employee {
		id: number;
		name: string;
		destajos: Destajo[];
	}
}

export {};
