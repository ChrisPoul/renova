export const categoryTypes = ['destajo', 'bono', 'deduccion'];

export const EMPLOYEE_COLUMNS = [
	{ key: 'name', label: 'Empleado', type: 'text' },
	{ key: 'codigo', label: 'Código', type: 'text' },
	{ key: 'area', label: 'Área', type: 'text' },
	{ key: 'puesto', label: 'Puesto', type: 'text' },
	{ key: 'cede', label: 'Cede', type: 'text' },
	{ key: 'salary', label: 'Salario', type: 'number' }
];

export const COMPUTED_COLUMNS = [
	{ employeeKey: 'totalPercepciones', totalKey: 'grandTotalPercepciones', label: 'Total Percepciones' },
	{ employeeKey: 'employeeTotals', totalKey: 'grandTotal', label: 'Total' }
];

export const CATEGORY_FIELDS = [
	{ key: 'concept', label: 'Concepto', type: 'text' },
	{ key: 'type', label: 'Tipo', type: 'text' },
	{ key: 'unit', label: 'Unidad', type: 'text' },
	{ key: 'unitMonetaryValue', label: 'Valor Monetario', type: 'number' },
	{ key: 'unitValueIsDerived', label: 'Valor Derivado', type: 'checkbox' }
];
