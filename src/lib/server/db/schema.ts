import { sqliteTable, text, int, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const weeksTable = sqliteTable('weeks', {
	id: int().primaryKey(),
	startDate: int('start_date', { mode: 'timestamp' }).notNull(),
	endDate: int('end_date', { mode: 'timestamp' }).notNull()
});

export const weeksRelations = relations(weeksTable, ({ many }) => ({
	employeesToWeeks: many(employeesToWeeksTable),
	categoriesToWeeks: many(categoriesToWeeksTable),
	incidences: many(incidencesTable)
}));

export const employeesTable = sqliteTable('employees', {
	id: int().primaryKey(),
	codigo: text().notNull().unique(),
	name: text().notNull().unique(),
	salary: real().notNull(),
	puesto: text().notNull(),
	area: text().notNull(),
	cede: text().notNull()
});
export const employeesRelations = relations(employeesTable, ({ many }) => ({
	incidences: many(incidencesTable),
	employeesToWeeks: many(employeesToWeeksTable)
}));

export const employeesToWeeksTable = sqliteTable('employees_to_weeks', {
	employeeId: int('employee_id')
		.notNull()
		.references(() => employeesTable.id, { onDelete: 'cascade' }),
	weekId: int('week_id')
		.notNull()
		.references(() => weeksTable.id, { onDelete: 'cascade' }),
	salary: real('salary').notNull(),
	puesto: text('puesto').notNull(),
	area: text('area').notNull(),
	cede: text('cede').notNull(),
	totalPercepcionesSistema: real('total_percepciones_sistema').notNull().default(0),
	totalDeduccionesSistema: real('total_deducciones_sistema').notNull().default(0),
	deposito: real('deposito').notNull().default(0),
	complementoSueldoEfectivo: real('complemento_sueldo_efectivo').notNull().default(0)
});
export const employeesToWeeksRelations = relations(employeesToWeeksTable, ({ one }) => ({
	week: one(weeksTable, {
		fields: [employeesToWeeksTable.weekId],
		references: [weeksTable.id]
	}),
	employee: one(employeesTable, {
		fields: [employeesToWeeksTable.employeeId],
		references: [employeesTable.id]
	})
}));

export const categoriesTable = sqliteTable('categories', {
	id: int().primaryKey(),
	concept: text().notNull().unique(),
	type: text().notNull(),
	unit: text().notNull(),
	unitMonetaryValue: real().notNull(),
	unitValueIsDerived: int({ mode: 'boolean' }).notNull().default(false)
});
export const categoriesRelations = relations(categoriesTable, ({ many }) => ({
	categoriesToWeeks: many(categoriesToWeeksTable)
}));

export const categoriesToWeeksTable = sqliteTable('categories_to_weeks', {
	categoryId: int('category_id')
		.notNull()
		.references(() => categoriesTable.id, { onDelete: 'cascade' }),
	weekId: int('week_id')
		.notNull()
		.references(() => weeksTable.id, { onDelete: 'cascade' }),
	concept: text('concept').notNull(),
	type: text('type').notNull(),
	unit: text('unit').notNull(),
	unitMonetaryValue: real('unit_monetary_value').notNull(),
	unitValueIsDerived: int('unit_value_is_derived', { mode: 'boolean' }).notNull().default(false)
});
export const categoriesToWeeksRelations = relations(categoriesToWeeksTable, ({ one }) => ({
	week: one(weeksTable, {
		fields: [categoriesToWeeksTable.weekId],
		references: [weeksTable.id]
	}),
	category: one(categoriesTable, {
		fields: [categoriesToWeeksTable.categoryId],
		references: [categoriesTable.id]
	})
}));

export const incidencesTable = sqliteTable('incidences', {
	id: int().primaryKey(),
	weekId: int('week_id')
		.notNull()
		.references(() => weeksTable.id, { onDelete: 'cascade' }),
	categoryId: int('cateogry_id')
		.notNull()
		.references(() => categoriesTable.id, { onDelete: 'cascade' }),
	employeeId: int('employee_id')
		.notNull()
		.references(() => employeesTable.id, { onDelete: 'cascade' }),
	amount: real().notNull().default(0),
	basedOnCategory: int({ mode: 'boolean' }).notNull().default(true),
	unit: text().notNull().default('kg'),
	unitMonetaryValue: real().notNull().default(1),
	unitValueIsDerived: int({ mode: 'boolean' }).notNull().default(false)
});

export const incidencesRelations = relations(incidencesTable, ({ one }) => ({
	employee: one(employeesTable, {
		fields: [incidencesTable.employeeId],
		references: [employeesTable.id]
	}),
	category: one(categoriesTable, {
		fields: [incidencesTable.categoryId],
		references: [categoriesTable.id]
	}),
	week: one(weeksTable, {
		fields: [incidencesTable.weekId],
		references: [weeksTable.id]
	})
}));
