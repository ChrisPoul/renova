export const categoryTypes = ['destajo', 'bono', 'deduccion'];


export const EMPLOYEE_COLUMNS = [
	{ key: 'name', label: 'Empleado', type: 'text' },
	{ key: 'codigo', label: 'Código', type: 'text' },
	{ key: 'area', label: 'Área', type: 'text' },
	{ key: 'puesto', label: 'Puesto', type: 'text' },
	{ key: 'cede', label: 'Cede', type: 'text' }
];

export const EMPLOEYEE_WEEK_COLUMNS = [
	{ key: 'salary', label: 'Salario', type: 'number', format: 'currency', sumKey: 'salary' },
	{ key: 'totalPercepcionesSistema', label: 'Total Percepciones Sistema', type: 'number', format: 'currency', sumKey: 'totalPercepcionesSistema' },
	{ key: 'totalDeduccionesSistema', label: 'Total Deducciones Sistema', type: 'number', format: 'currency', sumKey: 'totalDeduccionesSistema' },
	{ key: 'deposito', label: 'Depósito', type: 'number', format: 'currency', sumKey: 'deposito' },
	{ key: 'complementoSueldoEfectivo', label: 'Complemento Sueldo Efectivo', type: 'number', format: 'currency', sumKey: 'complementoSueldoEfectivo' }
]

export const EMPLOYEE_RESUMEN_COLUMNS = [
	{ key: 'deposito', label: 'Depósito', type: 'number', format: 'currency' },
	{ key: 'complementoEfectivo', label: 'Complemento Efectivo', type: 'number', format: 'currency' },
	{ key: 'bono', label: 'Bonos', type: 'number', format: 'currency' },
	{ key: 'destajo', label: 'Destajo', type: 'number', format: 'currency' },
	{ key: 'deduccion', label: 'Deducciones', type: 'number', format: 'currency' },
	{ key: 'numeroHorasExtra', label: 'Horas Extra', type: 'number' },
	{ key: 'importeHorasExtra', label: 'Importe Horas Extra', type: 'number', format: 'currency' },
	{ key: 'totalResumen', label: 'Total Resumen', type: 'number', format: 'currency' }
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

export interface SystemExcelColumn {
	excelHeader: string;   // Header exacto del Excel (fila 8)
	concepto: string;      // Nombre del concepto/categoría
	categoryType: 'bono' | 'deduccion' | 'destajo'; // Tipo de categoría
}

// Array para iterar fácilmente
export const SYSTEM_EXCEL_COLUMNS: SystemExcelColumn[] = [
	{ excelHeader: 'Fondo ahorro empresa', concepto: 'FONDO AHORRO', categoryType: 'deduccion' },
	{ excelHeader: '*TOTAL* *PERCEPCIONES*', concepto: 'Total Percepciones', categoryType: 'bono' },
	{ excelHeader: '*TOTAL* *DEDUCCIONES*', concepto: '*TOTAL* *DEDUCCIONES IMSS INFONAVIT F. AHORRO  FONACOT', categoryType: 'bono' },
	{ excelHeader: '*NETO*', concepto: 'DEPOSITO', categoryType: 'bono' }
];
