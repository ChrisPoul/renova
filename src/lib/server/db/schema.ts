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
	id: int().primaryKey(),
	concept: text().notNull(),
	type: text().notNull(),
	unit: text().notNull(),
	unitMonetaryValue: real().notNull(),
	unitValueIsDerived: int({ mode: 'boolean' }).default(false)
});

export const incidencesTable = sqliteTable('incidences', {
	id: int('id').primaryKey(),
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
