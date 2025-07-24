import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { and, gte, lte } from 'drizzle-orm';
import { weeksTable } from '$lib/server/db/schema';

function getDateFromWeekString(weekString: string): Date {
    const [year, week] = weekString.split('-W').map(Number);
    // Create a date for the first day of the year, then add the number of weeks in days.
    // This gives a date within the correct week.
    const date = new Date(year, 0, 1 + (week - 1) * 7);
    // Adjust to the Monday of that week.
    date.setDate(date.getDate() - (date.getDay() || 7) + 1);
    return date;
}

export async function GET({ url }) {
    const startWeek = url.searchParams.get('startWeek');
    const endWeek = url.searchParams.get('endWeek');

    if (!startWeek || !endWeek) {
        return json({ error: 'startWeek and endWeek are required' }, { status: 400 });
    }

    const start = getDateFromWeekString(startWeek);
    const end = getDateFromWeekString(endWeek);
    // Set the end date to the end of the week to include all days
    end.setDate(end.getDate() + 6);
    console.log(`Fetching report from ${start} to ${end}`);

    const weeks = await db.query.weeksTable.findMany({
        where: and(gte(weeksTable.startDate, start), lte(weeksTable.endDate, end)),
        with: {
            employees: {
                with: {
                    incidences: true
                }
            },
            incidenceCategories: true
        }
    });
    console.log(`Found ${weeks.length} weeks in the specified range`);

    const employeeMap = new Map();

    for (const week of weeks) {
        for (const employee of week.employees) {
            if (!employeeMap.has(employee.id)) {
                employeeMap.set(employee.id, {
                    ...employee,
                    salary: 0,
                    incidences: []
                });
            }

            const existingEmployee = employeeMap.get(employee.id);
            existingEmployee.salary += employee.salary;

            for (const incidence of employee.incidences) {
                const existingIncidence = existingEmployee.incidences.find(i => i.category === incidence.category);
                if (existingIncidence) {
                    existingIncidence.amount += incidence.amount;
                } else {
                    existingEmployee.incidences.push({ ...incidence });
                }
            }
        }
    }

    const employees = Array.from(employeeMap.values());
    const incidenceCategories = weeks.length > 0 ? weeks[0].incidenceCategories : [];

    return json({ employees, incidenceCategories });
}
