import { sqliteTable, text, int, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const weeksTable = sqliteTable('weeks', {
	id: int('id').primaryKey(),
	startDate: int('start_date', { mode: 'timestamp' }).notNull(),
	endDate: int('end_date', { mode: 'timestamp' }).notNull()
});

export const employeesTable = sqliteTable('employees', {
	id: int().primaryKey(),
	name: text().notNull(),
	salary: real().notNull(),
	puesto: text().notNull(),
	area: text().notNull()
});

export const employeesToWeeksTable = sqliteTable('employees_to_weeks', {
	employeeId: int('employee_id')
		.notNull()
		.references(() => employeesTable.id),
	weekId: int('week_id')
		.notNull()
		.references(() => weeksTable.id)
});

export const incidenceCategoriesTable = sqliteTable('incidence_categories', {
	id: int().primaryKey(),
	concept: text().notNull(),
	type: text().notNull(),
	unit: text().notNull(),
	unitMonetaryValue: real().notNull(),
	unitValueIsDerived: int({ mode: 'boolean' }).default(false)
});

export const categoriesToWeeksTable = sqliteTable('categories_to_weeks', {
	categoryId: int('category_id')
		.notNull()
		.references(() => incidenceCategoriesTable.id),
	weekId: int('week_id')
		.notNull()
		.references(() => weeksTable.id)
});

export const incidencesTable = sqliteTable('incidences', {
	id: int('id').primaryKey(),
	weekId: int('week_id')
		.notNull()
		.references(() => weeksTable.id),
	category: int()
		.notNull()
		.references(() => incidenceCategoriesTable.id, { onDelete: 'cascade' }),
	employee: int('employee')
		.notNull()
		.references(() => employeesTable.id, { onDelete: 'cascade' }),
	amount: real('amount').notNull(),
	basedOnCategory: int({ mode: 'boolean' }).default(true),
	unit: text().default('kg'),
	unitMonetaryValue: real().default(1),
	unitValueIsDerived: int({ mode: 'boolean' })
});

// --- Relations ---

export const weeksRelations = relations(weeksTable, ({ many }) => ({
	employeesToWeeks: many(employeesToWeeksTable),
	categoriesToWeeks: many(categoriesToWeeksTable)
}));

export const employeesRelations = relations(employeesTable, ({ many }) => ({
	incidencias: many(incidencesTable, { relationName: 'employee' }),
	employeesToWeeks: many(employeesToWeeksTable)
}));

export const incidenceCategoriesRelations = relations(incidenceCategoriesTable, ({ many }) => ({
	categoriesToWeeks: many(categoriesToWeeksTable)
}));

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

export const categoriesToWeeksRelations = relations(categoriesToWeeksTable, ({ one }) => ({
	week: one(weeksTable, {
		fields: [categoriesToWeeksTable.weekId],
		references: [weeksTable.id]
	}),
	category: one(incidenceCategoriesTable, {
		fields: [categoriesToWeeksTable.categoryId],
		references: [incidenceCategoriesTable.id]
	})
}));

export const incidencesRelations = relations(incidencesTable, ({ one }) => ({
	employee: one(employeesTable, {
		fields: [incidencesTable.employee],
		references: [employeesTable.id],
		relationName: 'employee'
	}),
	category: one(incidenceCategoriesTable, {
		fields: [incidencesTable.category],
		references: [incidenceCategoriesTable.id],
		relationName: 'category'
	}),
	week: one(weeksTable, {
		fields: [incidencesTable.weekId],
		references: [weeksTable.id]
	})
}));
