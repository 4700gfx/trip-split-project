/* TripSplit — script.js skeleton. Fill in every TODO. Sections map to TRIP-1..TRIP-12. */

/* -------------------- STATE -------------------- */
let people = []; // { id, name }
let expenses = []; // { id, description, amount, paidBy, category, splitType, splitBetween, customAmounts }

let activeFilters = {
	personId: 'all',
	category: 'all',
	sortBy: 'date-desc'
};

/* -------------------- DOM REFERENCES -------------------- */
// TODO: cache every element you'll reuse in a `dom` object
const personInput = document.querySelector('#personNameInput');
const tripName = document.querySelector('#tripNameInput');
const addPersonButton = document.querySelector('#addPersonBtn');
const memberCount = document.querySelector('#memberCountBadge');
const expenseCount = document.querySelector('#expenseCountBadge');
const totalSpent = document.querySelector('#totalSpentBadge');
// const currensyType = document.querySelector('');

function initalCapString(name) {
	if (!name) return;
	return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

/* ==================== TRIP-2: MEMBERS ==================== */

function addPerson(rawName) {
	// TODO: normalize + de-dupe case-insensitively, keep original casing, push, renderAll()
	const person = {};

	if (rawName == !String) return;

	person.id = crypto.randomUUID();
	person.name = initalCapString(rawName);
	people.push(person);
	console.log(`Added ${person.name} to the array`);
	console.log(people);
}

addPerson('shek');

function removePerson(personId) {
	// TODO: block removal if referenced in any expense (paidBy or splitBetween); else filter out + renderAll()
}

function renderMembers() {
	// TODO: rebuild #membersList from `people`; toggle empty state; refresh anything else that lists people
}

/* ==================== TRIP-3: EXPENSE FORM ==================== */

function populatePayerDropdown() {
	// TODO: rebuild #expensePayer options from `people`
}

function populateSplitCheckboxes() {
	// TODO: rebuild #splitBetweenCheckboxes, one checkbox per person
}

function getCheckedSplitPersonIds() {
	// TODO: return array of checked person ids
}

function validateExpenseForm(values) {
	// TODO: check amount is a valid number, splitBetween isn't empty, custom split sums correctly
}

function handleExpenseFormSubmit(event) {
	// TODO: preventDefault, read fields (default description), validate, build expense object,
	//       branch on #editingExpenseId to edit (map) vs add (push), reset form, renderAll()
}

/* ==================== TRIP-5: SPLIT CALCULATOR ==================== */

const splitCalculator = (() => {
	function equalSplit(amount, memberIds, payerId) {
		// TODO: divide evenly, give the leftover cent to payerId
	}
	function customSplitIsValid(amount, customAmounts) {
		// TODO: sum with reduce, compare with Math.abs(sum - amount) < 0.01
	}
	return { equalSplit, customSplitIsValid };
})();

/* ==================== TRIP-4 / TRIP-8: EXPENSE LIST ==================== */

function getFilteredSortedExpenses() {
	// TODO: filter `expenses` by activeFilters, sort a COPY with an explicit comparator
}

function renderExpenseList() {
	// TODO: render getFilteredSortedExpenses(); toggle the two empty states correctly
}

function deleteExpense(expenseId) {
	// TODO: filter it out, renderAll()
}

function startEditingExpense(expenseId) {
	// TODO: populate the form from the expense, set #editingExpenseId, show edit UI
}

function cancelEditingExpense() {
	// TODO: reset form to "new expense" state
}

/* ==================== TRIP-6: BALANCE ENGINE ==================== */

function computeBalances() {
	// TODO: reduce over `expenses` into a Map<personId, netAmount>, starting everyone at 0
}

function renderBalances() {
	// TODO: render computeBalances(); toggle empty state
}

/* ==================== TRIP-7: SETTLE-UP ALGORITHM ==================== */

function computeSettlements(balancesMap) {
	// TODO: greedy match largest creditor vs largest debtor until all balances are ~0
}

function renderSettleUp() {
	// TODO: render computeSettlements(computeBalances()); toggle empty state
}

/* ==================== TRIP-8: FILTERS ==================== */

function populateFilterDropdowns() {
	// TODO: rebuild #filterByPerson / #filterByCategory options
}

function handleFilterChange() {
	// TODO: read filter controls into activeFilters, renderExpenseList()
}

function clearFilters() {
	// TODO: reset activeFilters + controls, renderExpenseList()
}

/* ==================== TRIP-9: SUMMARY DASHBOARD ==================== */

function computeSummary() {
	// TODO: total, average (guard /0), top spender, byCategory — all via reduce
}

function renderSummary() {
	// TODO: write computeSummary() into the dl/dd elements and category bars
	// (set bar width via .style.width, not an interpolated Tailwind class)
}

/* ==================== TRIP-11: SHARE / EXPORT ==================== */

function buildShareText() {
	// TODO: template literal + Array.join('\n') for the settle-up lines
}

function handleCopySummary() {
	// TODO: navigator.clipboard.writeText(buildShareText()).then(...).catch(...)
}

/* ==================== RENDER ORCHESTRATION ==================== */

function renderAll() {
	// TODO: call every render*()/populate*() function in an order where nothing reads stale data
}

/* ==================== EVENT WIRING ==================== */

document.addEventListener('DOMContentLoaded', () => {
	// TODO: cache dom refs, wire all forms/buttons, use event delegation for #membersList and #expenseList
	renderAll();
});
