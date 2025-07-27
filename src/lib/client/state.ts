import { employees, incidenceCategories, incidenceCells } from '$lib/stores.svelte';
import { initiateIncidenceCell } from '$lib/utils';

export function addEmployee(employee: Employee, incidences: Incidence[]) {
	employees.value.set(employee.id, employee);
	for (const incidence of incidences) {
		const category = incidenceCategories.value.get(incidence.categoryId);
		initiateIncidenceCell(incidenceCells.value, incidence, category!, employee);
	}
	employees.value = new Map(employees.value);
	incidenceCells.value = new Map(incidenceCells.value);
}

export function updateEmployee(employee: Employee) {
	employees.value.set(employee.id, employee);
	for (const [categoryId, categoryIncidenceCells] of incidenceCells.value) {
		const category = incidenceCategories.value.get(categoryId);
		const incidenceCell = categoryIncidenceCells.get(employee.id);
		initiateIncidenceCell(incidenceCells.value, incidenceCell!.incidence, category!, employee);
	}
	employees.value = new Map(employees.value);
	incidenceCells.value = new Map(incidenceCells.value);
}

export function deleteEmployee(employeeId: number) {
	employees.value.delete(employeeId);
	for (const categoryIncidenceCells of incidenceCells.value.values()) {
		categoryIncidenceCells.delete(employeeId);
	}
	employees.value = new Map(employees.value);
	incidenceCells.value = new Map(incidenceCells.value);
}

export function addCategory(category: IncidenceCategory, incidences: Incidence[]) {
	incidenceCategories.value.set(category.id, category);
	for (const incidence of incidences) {
		const employee = employees.value.get(incidence.employeeId);
		initiateIncidenceCell(incidenceCells.value, incidence, category, employee!);
	}
	incidenceCategories.value = new Map(incidenceCategories.value);
	incidenceCells.value = new Map(incidenceCells.value);
}

export function updateCategory(category: IncidenceCategory) {
	incidenceCategories.value.set(category.id, category);
	const categoryIncidenceCells = incidenceCells.value.get(category.id);
	if (categoryIncidenceCells) {
		for (const [employeeId, incidenceCell] of categoryIncidenceCells) {
			const employee = employees.value.get(employeeId);
			initiateIncidenceCell(incidenceCells.value, incidenceCell.incidence, category, employee!);
		}
	}
	incidenceCategories.value = new Map(incidenceCategories.value);
	incidenceCells.value = new Map(incidenceCells.value);
}

export function deleteCategory(categoryId: number) {
	incidenceCategories.value.delete(categoryId);
	incidenceCells.value.delete(categoryId);
	incidenceCategories.value = new Map(incidenceCategories.value);
	incidenceCells.value = new Map(incidenceCells.value);
}
