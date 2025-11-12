import { categoryTypes, EMPLOEYEE_WEEK_COLUMNS } from './constants';

type CategoryId = number;
type employeeID = number;
type employeeCategoryTypeTotal = number;
type CategoryType = string;


export const employees = $state<{ value: Employees }>({ value: new Map() });

export interface IncidenceCell {
	incidence: Incidence;
	totalMonetaryValue: number;
	categoryType: CategoryType;
}

// The main reactive state for all incidence data
export type IncidenceCells = Map<CategoryId, Map<employeeID, IncidenceCell>>;
export const incidenceCells = $state<{ value: IncidenceCells }>({
	value: new Map()
});

// The shape of the object holding the aggregated total for a single category
type CategoryTotal = {
	amount: number;
	monetaryValue: number;
};

// The main derived state for all aggregated totals
const derivedTotals = $derived.by(() => {
	const newTotals = {
		grandTotal: 0,
		categoryTypeTotals: new Map<CategoryType, Map<employeeID, employeeCategoryTypeTotal>>(),
		categoryTypeGrandTotals: new Map<CategoryType, number>(),
		categoryTotals: new Map<CategoryId, CategoryTotal>(),
		employeeTotals: new Map<employeeID, number>(),
		totalPercepciones: new Map<employeeID, number>(),
		grandTotalPercepciones: 0,
		employeeWeekTotals: new Map<string, number>(),
	};

	for (const column of EMPLOEYEE_WEEK_COLUMNS) {
		newTotals.employeeWeekTotals.set(column.sumKey, 0);
	}
	for (const [, employee] of employees.value) {
		for (const column of EMPLOEYEE_WEEK_COLUMNS) {
			const currentValue = newTotals.employeeWeekTotals.get(column.sumKey) ?? 0;
			const employeeValue = Number(employee[column.key as keyof Employee] ?? 0);
			newTotals.employeeWeekTotals.set(column.sumKey, currentValue + employeeValue);
		}
	}

	console.log('Calculating totals...');
	// Loop through all incidences to calculate the totals
	for (const [categoryId, categoryIncidenceCells] of incidenceCells.value) {
		for (const [employeeId, incidenceCell] of categoryIncidenceCells) {
			const { incidence, totalMonetaryValue, categoryType } = incidenceCell;
			const amount = incidence.amount;

			if (!selectedCategoryTypes.value.includes(categoryType)) continue;

			// 1. Aggregate totals per category (for the table footer)
			const currentCategoryTotal = newTotals.categoryTotals.get(categoryId) ?? {
				amount: 0,
				monetaryValue: 0
			};
			currentCategoryTotal.amount += amount;
			currentCategoryTotal.monetaryValue += totalMonetaryValue;
			newTotals.categoryTotals.set(categoryId, currentCategoryTotal);

			// 2. Aggregate totals per employee per category type (for the employee row totals)
			if (!newTotals.categoryTypeTotals.has(categoryType)) {
				newTotals.categoryTypeTotals.set(categoryType, new Map());
			}
			const employeeCategoryTypeTotal =
				newTotals.categoryTypeTotals.get(categoryType)!.get(employeeId) ?? 0;
			newTotals.categoryTypeTotals
				.get(categoryType)!
				.set(employeeId, employeeCategoryTypeTotal + totalMonetaryValue);

			// 3. Aggregate grand totals per category type (for the table footer)
			const currentCategoryTypeGrandTotal =
				newTotals.categoryTypeGrandTotals.get(categoryType) ?? 0;
			newTotals.categoryTypeGrandTotals.set(
				categoryType,
				currentCategoryTypeGrandTotal + totalMonetaryValue
			);

			// 4. Aggregate totals per employee
			const currentEmployeeTotal = newTotals.employeeTotals.get(employeeId) ?? 0;
			if (categoryType === 'deduccion') {
				newTotals.employeeTotals.set(employeeId, currentEmployeeTotal - totalMonetaryValue);
			} else {
				newTotals.employeeTotals.set(employeeId, currentEmployeeTotal + totalMonetaryValue);
			}

			// 4.1. Calculate total percepciones (excluding deducciones)
			if (categoryType !== 'deduccion') {
				const currentTotalPercepciones = newTotals.totalPercepciones.get(employeeId) ?? 0;
				newTotals.totalPercepciones.set(employeeId, currentTotalPercepciones + totalMonetaryValue);
				// Add to grand total percepciones
				newTotals.grandTotalPercepciones += totalMonetaryValue;
			}

			// 5. Calculate the final grand total, subtracting deductions
			if (categoryType === 'deduccion') {
				newTotals.grandTotal -= totalMonetaryValue;
			} else {
				newTotals.grandTotal += totalMonetaryValue;
			}
		}
	}

	return newTotals;
});

export const totals = {
	get value() {
		return derivedTotals;
	}
};

export const selectedCategoryTypes = $state({
	value: categoryTypes
});

export const selectedWeek = $state<{ value: Week | null }>({
	value: null
});

export const isReadOnly = $state({ value: false });

export const categories = $state<{ value: Categories }>({ value: new Map() });

const derivedCategoriesByType = $derived.by(() => {
		const categoriesByType = new Map<CategoryType, Category[]>(
			selectedCategoryTypes.value.map((categoryType) => [categoryType, []])
		);
		for (const category of categories.value.values()) {
			if (!selectedCategoryTypes.value.includes(category.type)) continue;
			let categoriesInType = categoriesByType.get(category.type);
			if (categoriesInType === undefined) {
				categoriesInType = [];
			}
			categoriesInType.push(category);
			categoriesByType.set(category.type, categoriesInType);
		}
		return categoriesByType;
	});
export const categoriesByType = {
	get value() {
		return derivedCategoriesByType;
	}
}

type EmployeeResumenData = {
	deposito: number;
	complementoEfectivo: number;
	bono: number;
	destajo: number;
	deduccion: number;
	numeroHorasExtra: number;
	importeHorasExtra: number;
	totalResumen: number;
};

type ResumenData = {
	employees: Map<employeeID, EmployeeResumenData>;
	grandTotals: EmployeeResumenData;
};

const createEmptyResumenData = (): EmployeeResumenData => ({
	deposito: 0,
	complementoEfectivo: 0,
	bono: 0,
	destajo: 0,
	deduccion: 0,
	numeroHorasExtra: 0,
	importeHorasExtra: 0,
	totalResumen: 0
});

type ResumenCategoryType = 'bono' | 'destajo' | 'deduccion';

const resumenCategoryTypes = new Set<ResumenCategoryType>(['bono', 'destajo', 'deduccion']);

// The main derived state for resumen (summary) data
const derivedResumen = $derived.by(() => {
	const employeesResumen = new Map<employeeID, EmployeeResumenData>();
	const grandTotals = createEmptyResumenData();

	const ensureEmployeeResumen = (employeeId: employeeID): EmployeeResumenData => {
		let employeeResumen = employeesResumen.get(employeeId);
		if (!employeeResumen) {
			employeeResumen = createEmptyResumenData();
			employeesResumen.set(employeeId, employeeResumen);
		}
		return employeeResumen;
	};

	for (const [, employee] of employees.value) {
		const deposito = Number(employee.deposito ?? 0);
		const complementoEfectivo = Number(employee.complementoSueldoEfectivo ?? 0);
		const employeeResumen = ensureEmployeeResumen(employee.id);
		employeeResumen.deposito = deposito;
		employeeResumen.complementoEfectivo = complementoEfectivo;
		grandTotals.deposito += deposito;
		grandTotals.complementoEfectivo += complementoEfectivo;
	}

	for (const [categoryId, categoryIncidenceCells] of incidenceCells.value) {
		const category = categories.value.get(categoryId);
		if (!category) continue;

		const categoryType = category.type;
		const considerCategory = selectedCategoryTypes.value.includes(categoryType);
		const isResumenCategory = resumenCategoryTypes.has(categoryType as ResumenCategoryType);
		const isTiempoExtra = category.concept === 'TIEMPO EXTRA';

		if (!considerCategory && !isTiempoExtra) continue;

		for (const [employeeId, incidenceCell] of categoryIncidenceCells) {
			const employeeResumen = ensureEmployeeResumen(employeeId);

			if (isResumenCategory && considerCategory) {
				const totalValue = incidenceCell.totalMonetaryValue ?? 0;
				const categoryTypeKey = categoryType as ResumenCategoryType;
				employeeResumen[categoryTypeKey] += totalValue;
				grandTotals[categoryTypeKey] += totalValue;
			}

			if (isTiempoExtra) {
				const amount = incidenceCell.incidence.amount ?? 0;
				const totalValue = incidenceCell.totalMonetaryValue ?? 0;
				employeeResumen.numeroHorasExtra += amount;
				employeeResumen.importeHorasExtra += totalValue;
				grandTotals.numeroHorasExtra += amount;
				grandTotals.importeHorasExtra += totalValue;
			}
		}
	}

	for (const [, employeeResumen] of employeesResumen) {
		const totalResumen =
			employeeResumen.deposito +
			employeeResumen.complementoEfectivo +
			employeeResumen.bono +
			employeeResumen.destajo +
			employeeResumen.importeHorasExtra -
			employeeResumen.deduccion;
		employeeResumen.totalResumen = totalResumen;
		grandTotals.totalResumen += totalResumen;
	}

	return {
		employees: employeesResumen,
		grandTotals
	} satisfies ResumenData;
});

export const resumen = {
	get value() {
		return derivedResumen;
	}
};
