/* TripSplit — script.js skeleton. Fill in every TODO. Sections map to TRIP-1..TRIP-12. */

/* -------------------- STATE -------------------- */
let people = [
	{ id: 'p1', name: 'Black' },
	{ id: 'p2', name: 'Lou' },
	{ id: 'p3', name: 'Kidd' },
	{ id: 'p4', name: 'Slick' }
];

let expenses = [
	{
		id: 'e1',
		description: 'Groceries',
		amount: 60,
		paidBy: 'p2',
		category: 'food',
		splitType: 'equal',
		splitBetween: ['p2', 'p4'],
		customAmounts: null
		// 60 / 4 = 15.00 exactly — sanity-check baseline, no remainder to worry about
	},
	{
		id: 'e2',
		description: 'Taxi to airport',
		amount: 37,
		paidBy: 'p2',
		category: 'transport',
		splitType: 'equal',
		splitBetween: ['p2', 'p4'], // Mia deliberately left out
		customAmounts: null
		// 37 / 3 = 12.3333... — forces your remainder-to-payer logic to fire
	},
	{
		id: 'e3',
		description: 'Museum tickets',
		amount: 42.5,
		paidBy: 'p2',
		category: 'activities',
		splitType: 'custom',
		splitBetween: ['p2', 'p4'], // Priya not in this one at all
		customAmounts: { p2: 15.0, p3: 12.5, p4: 15.0 }
		// sums exactly to 42.50 — should pass customSplitIsValid
	},
	{
		id: 'e4',
		description: '',
		amount: 18.75,
		paidBy: 'p4',
		category: 'general',
		splitType: 'equal',
		splitBetween: ['p2', 'p4'],
		customAmounts: null
		// blank description -> should render/save as "Untitled expense"
		// 18.75 / 2 = 9.375 -> another rounding case, only 2 people this time
	},
	{
		id: 'e5',
		description: "Dinner — Alex's treat",
		amount: 100,
		paidBy: 'p2',
		category: 'food',
		splitType: 'custom',
		splitBetween: ['p2', 'p4'],
		customAmounts: { p1: 20, p2: 40, p3: 20, p4: 20 }
		// payer (Alex) is ALSO in the split and owes his own $40 share of it —
		// good check that your balance engine doesn't just zero out the payer
	}
];

let activeFilters = {
	personId: 'all',
	category: 'all',
	sortBy: 'date-desc'
};

/* -------------------- DOM REFERENCES -------------------- */
//DOM Elements for Initial Setup
const tripName = document.querySelector('#tripNameInput');
const setupMemberName = document.querySelector('#setupPersonNameInput');
const addPersonButton = document.querySelector('#setupAddPersonBtn');
const memberCount = document.querySelector('#memberCountBadge');
const expenseCount = document.querySelector('#expenseCountBadge');
const totalSpent = document.querySelector('#totalSpentBadge');
const memberListContainer = document.querySelector('#setupMembersList');

//DOM Elements for Adding Expenses
const addExpenseSplitRows = document.querySelector('#addExpenseSplitRows');

//DOM Element for Expense Form Input
const expenseDescription = document.querySelector(
	`#addExpenseDescriptionInput`
);
const expenseAmount = document.querySelector('#addExpenseAmountInput');
const expensePayer = document.querySelector('#addExpensePayerSelect');
const expenseCategory = document.querySelector('#addExpenseCategorySelect');
const expenseSplitTableContainer = document.querySelector(
	'#addExpenseSplitTable'
);
const addExpenseButton = document.querySelector('#addExpenseSaveBtn');

/* ==================== TRIP-2: MEMBERS ==================== */

function addPerson(rawName) {
	// TODO: normalize + de-dupe case-insensitively, keep original casing, push, renderAll()
	const alreadyEntered = people.some(
		(person) => person.name === initalCapString(rawName.trim())
	);

	console.log(alreadyEntered ? 'This has been Entered' : 'This is a New User');
	const person = {};

	if (!rawName || alreadyEntered) return;

	person.id = crypto.randomUUID();
	person.name = initalCapString(rawName);
	people.push(person);
	renderAll();
	console.log(`Added ${person.name} to the array`);
	console.log(people);
}

function removePerson(personId) {
	// TODO: block removal if referenced in any expense (paidBy or splitBetween); else filter out + renderAll()

	//Checcking if the Person has a Balance
	const owesBalance = expenses.some(
		(expense) =>
			expense.splitBetween.includes(personId) || expense.paidBy === personId
	);

	console.log(owesBalance);

	if (owesBalance) {
		//Returns if there is no Balance
		alert(`You owe an Amount`);
	} else {
		//Filter the Person and Rerender
		const updatedMembers = people.filter((person) => person.id !== personId);
		people = updatedMembers;
		console.log(people);
		console.log(`Person removed`);
		renderAll();
	}
}

function renderMemberChips() {
	//Setting the DOM Elements
	const memberListContainer = document.querySelector('#setupMembersList');
	const memberPillRow = people
		.map((person) => {
			return `<span data-person="${person.id}" class="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-indigo-50"><span class="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-semibold">${person.name.charAt(0).toUpperCase()}</span>${person.name} <span class="text-slate-400 remove-person-button">×</span></span>`;
		})
		.join('');

	//Adding Elements to Inner HTML
	memberListContainer.innerHTML = memberPillRow;
}

/* ==================== TRIP-3: EXPENSE FORM ==================== */

function populatePayerDropdown() {
	// TODO: rebuild #expensePayer options from people
	const payerSelect = document.querySelector('#addExpensePayerSelect');

	const expensePayers = people
		.map((person) => {
			return `<option value='${person.id}'>${person.name}</option>`;
		})
		.join('');

	payerSelect.innerHTML = expensePayers;
}

function populateSplitCheckboxes() {
	// TODO: rebuild #splitBetweenCheckboxes, one checkbox per person

	const splitRowsHTML = people
		.map((person) => {
			return `<div data-person-id="${person.id}" 
		class="grid grid-cols-[28px_1fr_120px_80px] gap-3 px-4 py-3 border-t border-slate-100 items-center text-sm">
			<input
				type="checkbox"
				class="split-person-checkbox w-4 h-4"
				data-person-id="${person.id}"
			/>
			<span class="flex items-center gap-2">
				<span
					class="w-5 h-5 rounded-full bg-slate-400 text-white text-[10px] flex items-center justify-center font-semibold"
					>${person.name.charAt(0).toUpperCase()}</span
				>${person.name}</span
			>
			<input
				type="text"
				inputmode="decimal"
				class="split-person-amount border border-slate-300 rounded-md px-2 py-1 bg-white w-full"
				data-person-id="${person.id}"
				value=""
			/>
			<span class="text-right text-slate-500 split-person-share">—</span>
		</div>`;
		})
		.join('');

	addExpenseSplitRows.innerHTML = splitRowsHTML;
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
	// TODO: call every render*()/populate*() function in an order where nothing reads stale 	data

	renderMemberChips();
	populatePayerDropdown();
	populateSplitCheckboxes();
}

/* ==================== HELPER FUNCTIONS ==================== */

function initalCapString(name) {
	if (!name) return;
	return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

/* ==================== EVENT WIRING ==================== */

document.addEventListener('DOMContentLoaded', () => {
	// TODO: cache dom refs, wire all forms/buttons, use event delegation for #membersList and #expenseList
	renderAll();
});

//Adding a Person to Set Up Trip
addPersonButton.addEventListener('click', () => {
	const memberName = initalCapString(setupMemberName.value);

	if (!memberName) {
		alert('Please Type in a Name');
	} else {
		console.log(memberName);
		addPerson(memberName);
		setupMemberName.value = '';
	}
});

memberListContainer.addEventListener('click', (event) => {
	const deleteButton = event.target.closest('[data-person]');

	if (!deleteButton) {
		return;
	}

	const personId = deleteButton.dataset.person;
	removePerson(personId);
	renderMemberChips();
});

addExpenseButton.addEventListener('click', (event) => {
	const newExpense = {};
	const expenseId = crypto.randomUUID();
	const expenseName = expenseDescription.value;
	const expenseValue = expenseAmount.value;
	const category = expenseCategory.value;
});

// {
// 	id: 'e1',
// 	description: 'Groceries',
// 	amount: 60,
// 	paidBy: 'p2',
// 	category: 'food',
// 	splitType: 'equal',
// 	splitBetween: ['p2', 'p4'],
// 	customAmounts: null
// 	// 60 / 4 = 15.00 exactly — sanity-check baseline, no remainder to worry about
// }
