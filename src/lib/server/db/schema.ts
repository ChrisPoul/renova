import { sqliteTable, text, int, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const employeesTable = sqliteTable('employees', {
	id: int().primaryKey(),
	name: text().notNull(),
	salary: real().notNull(),
	puesto: text().notNull(),
	area: text().notNull()
});

export const incidenceCategoriesTable = sqliteTable('incidence_categories', {
	id: int('id').primaryKey(),
	concept: text('concept').notNull(),
	type: text('type').notNull(),
	unit: text('unit').notNull(),
	unitMonetaryValue: real('unitMonetaryValue').notNull()
});

export const incidencesTable = sqliteTable('incidences', {
	id: int('id').primaryKey(),
	category: int()
		.notNull()
		.references(() => incidenceCategoriesTable.id, { onDelete: 'cascade' }), // <-- Add this
	employee: int('employee')
		.notNull()
		.references(() => employeesTable.id),
	amount: real('amount').notNull(),
	unitMonetaryValue: real('unitMonetaryValue'),
	unit: text('unit')
});

// --- Relations ---
export const employeesRelations = relations(employeesTable, ({ many }) => ({
	incidencias: many(incidencesTable, { relationName: 'employee' })
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
	})
}));
