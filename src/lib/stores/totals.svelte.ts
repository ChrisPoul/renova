type categoryID = number
type employeeID = number
type employeeTotal = number
type destajoID = number
type destajoTotal = number

interface Totals {
  byCategory: Map<categoryID, Map<destajoID, destajoTotal>>
  byEmployee: Map<employeeID, employeeTotal>
}

export const totals = $state<Totals>({ 
  byCategory: new Map(),
  byEmployee: new Map()
 });
