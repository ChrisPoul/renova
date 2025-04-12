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
		unitValue: number;
	}
	interface Destajo {
		id: number;
		category: number;
		amount: number;
	}
	interface Employee {
		name: string;
		destajos: Destajo[];
	}
}

export {};
