import { sqliteTable, text, int, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const weeksTable = sqliteTable('weeks', {
	id: int('id').primaryKey(),
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
	name: text('name').notNull().unique(),
	salary: real().notNull(),
	puesto: text().notNull(),
	area: text().notNull()
});
export const employeesRelations = relations(employeesTable, ({ many }) => ({
	incidences: many(incidencesTable, { relationName: 'employee' }),
	employeesToWeeks: many(employeesToWeeksTable)
}));

export const employeesToWeeksTable = sqliteTable('employees_to_weeks', {
	employeeId: int('employee_id')
		.notNull()
		.references(() => employeesTable.id),
	weekId: int('week_id')
		.notNull()
		.references(() => weeksTable.id)
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

export const categoriesTable = sqliteTable('incidence_categories', {
	id: int().primaryKey(),
	concept: text('concept').notNull().unique(),
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
		.references(() => categoriesTable.id),
	weekId: int('week_id')
		.notNull()
		.references(() => weeksTable.id)
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
	id: int('id').primaryKey(),
	weekId: int('week_id')
		.notNull()
		.references(() => weeksTable.id),
	categoryId: int()
		.notNull()
		.references(() => categoriesTable.id, { onDelete: 'cascade' }),
	employeeId: int('employee')
		.notNull()
		.references(() => employeesTable.id, { onDelete: 'cascade' }),
	amount: real('amount').notNull().default(0),
	basedOnCategory: int({ mode: 'boolean' }).notNull().default(true),
	unit: text().notNull().default('kg'),
	unitMonetaryValue: real().notNull().default(1),
	unitValueIsDerived: int({ mode: 'boolean' }).notNull().default(false)
});

export const incidencesRelations = relations(incidencesTable, ({ one }) => ({
	employee: one(employeesTable, {
		fields: [incidencesTable.employeeId],
		references: [employeesTable.id],
		relationName: 'employee'
	}),
	category: one(categoriesTable, {
		fields: [incidencesTable.categoryId],
		references: [categoriesTable.id],
		relationName: 'category'
	}),
	week: one(weeksTable, {
		fields: [incidencesTable.weekId],
		references: [weeksTable.id]
	})
}));