import { sqliteTable, text, int, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const employees = sqliteTable('employees', {
	id: int().primaryKey(),
	name: text().notNull(),
	salary: real().notNull(),
	puesto: text().notNull(),
	area: text().notNull()
});

export const incidenceCategories = sqliteTable('incidence_categories', {
	id: int('id').primaryKey(),
	concept: text('concept').notNull(),
	type: text('type').notNull(),
	unit: text('unit').notNull(),
	unitMonetaryValue: real('unitMonetaryValue').notNull()
});

export const incidences = sqliteTable('incidences', {
	id: int('id').primaryKey(),
	category: int('category')
		.notNull()
		.references(() => incidenceCategories.id),
	employee: int('employee')
		.notNull()
		.references(() => employees.id),
	amount: real('amount').notNull(),
	unitMonetaryValue: real('unitMonetaryValue'),
	unit: text('unit')
});

// --- Relations ---
export const employeesRelations = relations(employees, ({ many }) => ({
	incidencias: many(incidences, { relationName: 'employee' })
}));

export const incidencesRelations = relations(incidences, ({ one }) => ({
	employee: one(employees, {
		fields: [incidences.employee],
		references: [employees.id],
		relationName: 'employee'
	}),
	category: one(incidenceCategories, {
		fields: [incidences.category],
		references: [incidenceCategories.id],
		relationName: 'category'
	})
}));
