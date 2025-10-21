import { employees, categories, incidenceCells } from '$lib/stores.svelte';
import { initiateIncidenceCell } from '$lib/utils';

export function addEmployee(employee: Employee, incidences: Incidence[]) {
	employees.value.set(employee.id, employee);
	for (const incidence of incidences) {
		const category = categories.value.get(incidence.categoryId);
		initiateIncidenceCell(incidenceCells.value, incidence, category!, employee);
	}
	employees.value = new Map(employees.value);
	incidenceCells.value = new Map(incidenceCells.value);
}

export function updateEmployee(employee: Partial<Employee> & { id: number }) {
	const existingEmployee = employees.value.get(employee.id);
	if (existingEmployee) {
		const updatedEmployee = { ...existingEmployee, ...employee };
		employees.value.set(employee.id, updatedEmployee);
		for (const [categoryId, categoryIncidenceCells] of incidenceCells.value) {
			const category = categories.value.get(categoryId);
			const incidenceCell = categoryIncidenceCells.get(employee.id);
			if (incidenceCell) {
				initiateIncidenceCell(incidenceCells.value, incidenceCell.incidence, category!, updatedEmployee);
			}
		}
		employees.value = new Map(employees.value);
		incidenceCells.value = new Map(incidenceCells.value);
	}
}

export function deleteEmployee(employeeId: number) {
	employees.value.delete(employeeId);
	for (const categoryIncidenceCells of incidenceCells.value.values()) {
		categoryIncidenceCells.delete(employeeId);
	}
	employees.value = new Map(employees.value);
	incidenceCells.value = new Map(incidenceCells.value);
}

export function addCategory(category: Category, incidences: Incidence[]) {
	categories.value.set(category.id, category);
	for (const incidence of incidences) {
		const employee = employees.value.get(incidence.employeeId);
		initiateIncidenceCell(incidenceCells.value, incidence, category, employee!);
	}
	categories.value = new Map(categories.value);
	incidenceCells.value = new Map(incidenceCells.value);
}

export function updateCategory(category: Category) {
	categories.value.set(category.id, category);
	const categoryIncidenceCells = incidenceCells.value.get(category.id);
	if (categoryIncidenceCells) {
		for (const [employeeId, incidenceCell] of categoryIncidenceCells) {
			const employee = employees.value.get(employeeId);
			initiateIncidenceCell(incidenceCells.value, incidenceCell.incidence, category, employee!);
		}
	}
	categories.value = new Map(categories.value);
	incidenceCells.value = new Map(incidenceCells.value);
}

export function deleteCategory(categoryId: number) {
	categories.value.delete(categoryId);
	incidenceCells.value.delete(categoryId);
	categories.value = new Map(categories.value);
	incidenceCells.value = new Map(incidenceCells.value);
}
