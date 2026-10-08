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
		createdAt: Date.now() - 5 * 86400000, // 5 days ago (oldest)
		description: 'Groceries',
		amount: 60,
		paidBy: 'p2',
		category: 'food',
		splitType: 'equal',
		splitBetween: ['p1', 'p2', 'p3', 'p4'],
		customAmounts: null
		// 60 / 4 = 15.00 exactly — sanity-check baseline, no remainder to worry about
	},
	{
		id: 'e2',
		createdAt: Date.now() - 4 * 86400000, // 4 days ago
		description: 'Taxi to airport',
		amount: 37,
		paidBy: 'p2',
		category: 'transport',
		splitType: 'equal',
		splitBetween: ['p2', 'p3', 'p4'], // Black deliberately left out
		customAmounts: null
		// 37 / 3 = 12.3333... — forces your remainder-to-payer logic to fire
	},
	{
		id: 'e3',
		createdAt: Date.now() - 3 * 86400000, // 3 days ago
		description: 'Museum tickets',
		amount: 42.5,
		paidBy: 'p2',
		category: 'activities',
		splitType: 'custom',
		splitBetween: ['p2', 'p3', 'p4'], // Black not in this one at all
		customAmounts: { p2: 15.0, p3: 12.5, p4: 15.0 }
		// sums exactly to 42.50 — should pass customSplitIsValid
	},
	{
		id: 'e4',
		createdAt: Date.now() - 2 * 86400000, // 2 days ago
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
		createdAt: Date.now() - 1 * 86400000, // 1 day ago (newest sample)
		description: "Dinner — Lou's treat",
		amount: 100,
		paidBy: 'p2',
		category: 'food',
		splitType: 'custom',
		splitBetween: ['p1', 'p2', 'p3', 'p4'],
		customAmounts: { p1: 20, p2: 40, p3: 20, p4: 20 }
		// payer (Lou) is ALSO in the split and owes their own $40 share of it —
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
const expensesRows = document.querySelector('#expensesRows');

//DOM Elements for Filters
const expensesPersonFilterSelect = document.querySelector(
	'#expensesPersonFilterSelect'
);
const expensesCategoryFilterSelect = document.querySelector(
	'#expensesCategoryFilterSelect'
);
const expensesSortSelect = document.querySelector('#expensesSortSelect');
const clearFilterButton = document.querySelector('#expensesClearAllLink');

const expenseFilterSummary = document.querySelector('#expensesFilterSummary');
const expenseActiveFilterChips = document.querySelector(
	'#expensesActiveFilterChip'
);

const expensesSidebarBalances = document.querySelector(
	'#expensesSidebarBalanceList'
);
const expensesSidebarBalanceSum = document.querySelector(
	'#expensesSidebarBalanceSum'
);

const settleUpList = document.querySelector('#settleUpList');

/* ==================== TRIP-2: MEMBERS ==================== */

//Adding and Removing Person to People Object
function addPerson(rawName) {
	const alreadyEntered = people.some(
		(person) => person.name === initalCapString(rawName.trim())
	);

	console.log(alreadyEntered ? 'This has been Entered' : 'This is a New User');
	const person = {};

	if (!rawName || alreadyEntered) return;

	//Adding Person Object to People Array
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
		return;
	} else {
		//Filter the Person and Rerender
		const updatedMembers = people.filter((person) => person.id !== personId);
		people = updatedMembers;
		console.log(people);
		console.log(`Person removed`);
		renderAll();
	}
}

//Rending People Chips from People Array
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
	const payerSelect = document.querySelector('#addExpensePayerSelect');

	const expensePayers = people
		.map((person) => {
			return `<option value='${person.id}'>${person.name}</option>`;
		})
		.join('');

	payerSelect.innerHTML = expensePayers;
}

function populateSplitCheckboxes() {
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
	const peopleCheckbox = document.querySelectorAll('.split-person-checkbox');
	const peopleCheckboxArr = [...peopleCheckbox];
	console.log(peopleCheckboxArr);

	//Filtered Checked Boxes
	const checkedPeople = peopleCheckboxArr.filter(
		(checkbox) => checkbox.checked
	);

	return checkedPeople.map((person) => person.dataset.personId);
}

function getCustomAmounts(checkedPersonId) {
	const customAmountObj = checkedPersonId.reduce((accumulator, currentItem) => {
		const splitAmount = document.querySelector(
			`.split-person-amount[data-person-id="${currentItem}"]`
		);

		accumulator[currentItem] = Number(splitAmount.value);

		console.log(Number(splitAmount.value));
		return accumulator;
	}, {});

	return customAmountObj;
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
		const totalCents = Math.round(amount * 100);
		const baseCentShare = Math.floor(totalCents / memberIds.length);
		const leftoverCents = totalCents - baseCentShare * memberIds.length;
		const equalSplitAmount = memberIds.reduce((accumulator, currentMember) => {
			if (currentMember === payerId) {
				accumulator[currentMember] = (baseCentShare + leftoverCents) / 100;
			} else {
				accumulator[currentMember] = baseCentShare / 100;
			}

			console.log(accumulator);
			return accumulator;
		}, {});

		return equalSplitAmount;
	}
	function customSplitIsValid(amount, customAmounts) {
		// TODO: sum with reduce, compare with Math.abs(sum - amount) < 0.01
		const customAmountValues = Object.values(customAmounts);
		const sum = customAmountValues.reduce(
			(accumulator, currentValue) => accumulator + currentValue,
			0
		);
		return Math.abs(sum - amount) < 0.01;
	}
	return { equalSplit, customSplitIsValid };
})();

/* ==================== TRIP-4 / TRIP-8: EXPENSE LIST ==================== */

//Rendering Expenses from Expense Array
function renderExpenseList() {
	const visibleExpenses = getFilteredSortedExpenses();

	let rowsHTML;
	if (expenses.length === 0) {
		rowsHTML = `<div class="flex flex-col items-center text-center gap-3 py-12 px-6">
									<span class="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100"></span>
									<p class="text-xl font-bold">No expenses yet</p>
									<p class="text-sm text-slate-500 max-w-xs">
										Log the first thing someone paid for and balances start filling in.
									</p>
									<button
										class="tab-btn mt-1 px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold"
										data-target="screen-02"
									>
										Add expense
									</button>
								</div>`;
	} else if (visibleExpenses.length === 0) {
		rowsHTML = `<div class="flex flex-col items-center text-center gap-3 py-12 px-6">
									<span class="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200"></span>
									<p class="text-xl font-bold">Nothing matches these filters</p>
									<p class="text-sm text-slate-500 max-w-xs">
										Try a different person or category, or clear the filters to see every expense.
									</p>
									<button
										class="clear-filters-btn mt-1 px-5 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50"
									>
										Clear filters
									</button>
								</div>`;
	} else {
		rowsHTML = visibleExpenses
			.map((expense) => {
				const payer = people.find((person) => expense.paidBy === person.id);
				// || (not ??) because a blank description is '' — falsy, but not null
				const descriptionText = expense.description || 'Untitled expense';
				// map + find + join: turn split ids into a readable list of names
				const splitNames = expense.splitBetween
					.map(
						(id) => people.find((person) => person.id === id)?.name ?? 'Unknown'
					)
					.join(', ');
				// Row grid MUST match the static header grid in index.html exactly
				return `<div
									data-expense-id="${expense.id}"
									class="grid grid-cols-[32px_minmax(0,1fr)_88px_64px] gap-3 px-5 py-3 min-h-[64px] border-t border-slate-100 items-center text-sm hover:bg-slate-50 transition-colors"
								>
									<span
										class="w-8 h-8 rounded-full bg-slate-400 text-white text-xs flex items-center justify-center font-semibold"
										title="Paid by ${payer?.name ?? 'Unknown'}"
										>${payer?.name?.charAt(0).toUpperCase() ?? 'U'}</span
									>
									<div class="min-w-0">
										<p class="font-medium truncate">${descriptionText}</p>
										<p class="flex items-center gap-2 mt-0.5 text-xs text-slate-500 min-w-0">
											<span class="shrink-0 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
												>${initalCapString(expense.category)}</span
											>
											<span class="truncate">${payer?.name ?? 'Unknown'} paid · split with ${splitNames}</span>
										</p>
									</div>
									<span class="text-right font-semibold tabular-nums">$${expense.amount.toFixed(2)}</span>
									<button
										class="delete-expense-btn justify-self-end px-2 py-1 rounded-md text-red-600 text-xs font-medium hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
										data-expense-id="${expense.id}"
										aria-label="Delete expense"
									>
										Delete
									</button>
								</div>`;
			})
			.join('');
	}

	expensesRows.innerHTML = rowsHTML;
	renderFilterSummary(visibleExpenses);
}

function getFilteredSortedExpenses() {
	//Intialize Array for Filtering
	let filteredExpenses;

	//Check The First Active Filter
	if (activeFilters.personId === 'all') {
		filteredExpenses = expenses;
	} else {
		filteredExpenses = expenses.filter((expense) => {
			return (
				activeFilters.personId === expense.paidBy ||
				expense.splitBetween.includes(activeFilters.personId)
			);
		});
	}

	//Chaining Filter with Another If/Else Block
	if (activeFilters.category !== 'all') {
		filteredExpenses = filteredExpenses.filter(
			(expense) => expense.category === activeFilters.category
		);
	}

	//Speading Filtered Expenses to Sort Based on Date or Amount
	if (activeFilters.sortBy.includes('date')) {
		filteredExpenses =
			activeFilters.sortBy === 'date-asc'
				? [...filteredExpenses].sort((a, b) => a.createdAt - b.createdAt)
				: [...filteredExpenses].sort((a, b) => b.createdAt - a.createdAt);
	} else if (activeFilters.sortBy.includes('amount')) {
		filteredExpenses =
			activeFilters.sortBy === 'amount-asc'
				? [...filteredExpenses].sort((a, b) => a.amount - b.amount)
				: [...filteredExpenses].sort((a, b) => b.amount - a.amount);
	} else {
		filteredExpenses = [...filteredExpenses];
	}

	return filteredExpenses;
}

function deleteExpense(expenseId) {
	// TODO: filter it out, renderAll()
	const filteredExpenses = expenses.filter(
		(expense) => expense.id !== expenseId
	);
	expenses = filteredExpenses;
	renderAll();
}

function startEditingExpense(expenseId) {
	// TODO: populate the form from the expense, set #editingExpenseId, show edit UI
}

function cancelEditingExpense() {
	// TODO: reset form to "new expense" state
}

/* ==================== TRIP-6: BALANCE ENGINE ==================== */

function computeBalances() {
	//Create New Map for Shares
	const balanceMap = new Map(people.map((person) => [person.id, 0]));
	console.log(balanceMap);

	//Reduces Shares into Map
	const balances = expenses.reduce((accumulator, expense) => {
		//Determine Shares based on Split Type
		const shares =
			expense.splitType === 'custom'
				? expense.customAmounts
				: splitCalculator.equalSplit(
						expense.amount,
						expense.splitBetween,
						expense.paidBy
					);

		//Getting and Setting Payer Share
		const payerCurrent = accumulator.get(expense.paidBy);
		accumulator.set(expense.paidBy, payerCurrent + expense.amount);

		//Retriving Shares
		const shareMembers = Object.keys(shares);

		//Filters the Share List with Split Between
		const filteredMembers = expense.splitBetween.filter((memberId) =>
			shareMembers.includes(memberId)
		);

		//Loop Over Filter Member and Map their Values
		filteredMembers.forEach((member) => {
			const memberCurrent = accumulator.get(member);
			accumulator.set(member, memberCurrent - shares[member]);
		});

		return accumulator;
	}, balanceMap);

	return balances;
}

const result = computeBalances();
console.log([...result.values()].reduce((a, b) => a + b, 0));

function renderBalances() {
	const balances = computeBalances();
	const balancesArr = Array.from(balances, ([id, balance]) => ({
		id,
		name: people.find((person) => person.id === id)?.name || 'Unknown',
		balance
	}));

	const sortedBalanceArr = [...balancesArr].sort(
		(a, b) => b.balance - a.balance
	);

	const largestBalance = Math.max(
		...sortedBalanceArr.map((row) => Math.abs(row.balance))
	);

	const balancesHTML = sortedBalanceArr
		.map((row) => {
			const isOwed = row.balance >= 0;
			const amountText = `${isOwed ? '+' : '−'}${Math.abs(row.balance).toFixed(2)}`;
			const amountColorClass = isOwed ? 'text-emerald-700' : 'text-red-600';
			const barColorClass = isOwed ? 'bg-emerald-500' : 'bg-red-500';
			const barWidth =
				largestBalance === 0
					? 0
					: (Math.abs(row.balance) / largestBalance) * 100;

			return `<div data-person="${row.id}">
						<div class="flex justify-between mb-1">
							<span>${row.name}</span>
							<span class="font-semibold tabular-nums ${amountColorClass}">${amountText}</span>
						</div>
						<div class="h-2 rounded-full bg-slate-100">
							<div class="h-2 rounded-full ${barColorClass}" style="width: ${barWidth}%"></div>
						</div>
					</div>`;
		})
		.join('');

	expensesSidebarBalances.innerHTML = balancesHTML;

	const balanceSum = sortedBalanceArr.reduce(
		(sum, row) => sum + row.balance,
		0
	);
	const displaySum = Math.abs(balanceSum) < 0.005 ? 0 : balanceSum;
	expensesSidebarBalanceSum.textContent = `sums to ${displaySum.toFixed(2)}`;
}

/* ==================== TRIP-7: SETTLE-UP ALGORITHM ==================== */

function computeSettlements(balancesMap) {
	//Turn the Balances Map into an Array of Objects
	const mainBalances = Array.from(balancesMap, ([id, balance]) => ({
		id,
		balance
	})).filter((person) => Math.abs(person.balance) > 0.01);

	//Filter Out All Members with $0 Balance
	const sortedBalances = [...mainBalances];
	sortedBalances.sort((a, b) => b.balance - a.balance);

	//Adding Payment Until It Hits $0
	const payments = [];

	while (sortedBalances.length > 1) {
		const creditor = sortedBalances[0]; //Highest Creditor
		const debtor = sortedBalances.at(-1); // Highest Debtor

		const paymentAmount = Math.min(creditor.balance, Math.abs(debtor.balance));

		payments.push({
			from: debtor.id,
			to: creditor.id,
			amount: paymentAmount
		});

		//Removes Balances Owed and Collected for After Pushing
		creditor.balance -= paymentAmount;
		debtor.balance += paymentAmount;

		//Checkes to See If Credit Still Owes and Removes if Not
		if (Math.abs(creditor.balance) < 0.01) {
			sortedBalances.shift();
		}

		//Checks to See If Debtor Still Owes and Pops If Not
		if (Math.abs(debtor.balance) < 0.01) {
			sortedBalances.pop();
		}
	}

	return payments;
}

function renderSettleUp() {
	// TODO: render computeSettlements(computeBalances()); toggle empty state
	const payments = computeSettlements(computeBalances());

	let settleHTML;

	if (payments.length === 0) {
		settleHTML = `<div class="flex flex-col items-center text-center gap-3 py-12 px-6">
										<span class="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100"></span>
										<p class="text-xl font-bold">Everyone's square</p>
										<p class="text-sm text-slate-500 max-w-xs">
											All balances are 0.00. Nothing left to settle for this trip.
										</p>
									</div>`;
	} else {
		settleHTML = payments
			.map((payment) => {
				const fromName = people.find(
					(person) => payment.from === person.id
				)?.name;
				const toName = people.find((person) => payment.to === person.id)?.name;

				return `<div class="grid grid-cols-[1fr_32px_1fr_auto] gap-3 items-center px-5 py-4 border-t border-slate-100 first:border-t-0">
					<span class="flex items-center gap-2 min-w-0">
						<span class="shrink-0 w-8 h-8 rounded-full bg-slate-400 text-white flex items-center justify-center font-semibold">${fromName.charAt(0)}</span>
						<span class="truncate">${fromName}</span>
					</span>
					<span class="text-center text-indigo-600" aria-hidden="true">→</span>
					<span class="flex items-center gap-2 min-w-0">
						<span class="shrink-0 w-8 h-8 rounded-full bg-slate-400 text-white flex items-center justify-center font-semibold">${toName.charAt(0)}</span>
						<span class="truncate">${toName}</span>
					</span>
					<span class="text-right font-bold text-xl tabular-nums">$${payment.amount.toFixed(2)}</span>
				</div>`;
			})
			.join('');
	}

	settleUpList.innerHTML = settleHTML;
}

/* ==================== TRIP-8: FILTERS ==================== */

function renderFilterSummary(visibleExpenses) {
	const visibleCount = visibleExpenses.length;
	const totalCount = expenses.length;
	const shownTotal = visibleExpenses.reduce(
		(sum, expense) => sum + expense.amount,
		0
	);

	expenseFilterSummary.textContent = `${visibleCount} of ${totalCount} expenses · $${shownTotal.toFixed(2)} shown`;

	const expenseLabels = [];

	if (activeFilters.personId !== 'all') {
		expenseLabels.push(
			people.find((person) => activeFilters.personId === person.id)?.name ||
				'Unknown'
		);
	}

	if (activeFilters.category !== 'all') {
		expenseLabels.push(initalCapString(activeFilters.category));
	}

	if (expenseLabels.length === 0) {
		expenseActiveFilterChips.classList.add('hidden');
	} else {
		expenseActiveFilterChips.classList.remove('hidden');
		expenseActiveFilterChips.textContent = `${expenseLabels.join(' · ')}`;
	}
}

function populateFilterDropdowns() {
	// TODO: rebuild #filterByPerson / #filterByCategory options
	const personFilter = expensesPersonFilterSelect;

	const allSelectOption = `<option value="all">Person: All</option>`;

	const filterDropdowns = people
		.map((person) => `<option value="${person.id}">${person.name}</option>`)
		.join('');

	const allOptions = allSelectOption.concat(filterDropdowns);
	personFilter.innerHTML = allOptions;
	expensesPersonFilterSelect.value = activeFilters.personId;
}

function handleFilterChange() {
	activeFilters.personId = expensesPersonFilterSelect.value;
	activeFilters.category = expensesCategoryFilterSelect.value;
	activeFilters.sortBy = expensesSortSelect.value;

	renderExpenseList();
}

function clearFilters() {
	activeFilters.personId = 'all';
	activeFilters.category = 'all';
	activeFilters.sortBy = 'date-desc';

	expensesPersonFilterSelect.value = activeFilters.personId;
	expensesCategoryFilterSelect.value = activeFilters.category;
	expensesSortSelect.value = activeFilters.sortBy;
	renderExpenseList();
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
	renderExpenseList();
	renderBalances();
	renderSettleUp();
	populatePayerDropdown();
	populateSplitCheckboxes();
	populateFilterDropdowns();
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

//Deleting a Member from Expense
memberListContainer.addEventListener('click', (event) => {
	const deleteButton = event.target.closest('[data-person]');

	if (!deleteButton) {
		return;
	}

	const personId = deleteButton.dataset.person;
	removePerson(personId);
	renderAll();
});

//Adding Expenses
addExpenseButton.addEventListener('click', (event) => {
	//Initalizing New Expense Object
	const newExpense = {};

	//Reading the Value of DOM Elements
	const payer = expensePayer.value;
	const expenseName = !expenseDescription.value
		? 'Untitled expense'
		: expenseDescription.value;

	const category = expenseCategory.value;
	const expenseId = crypto.randomUUID();
	const amountValue = Number(expenseAmount.value);

	//Gaurd Clause for If the Expense is not a Number
	if (Number.isNaN(amountValue)) {
		alert(`Please add a Valid Number for This Expense`);
		return;
	}

	const splitType = document.querySelector(
		'input[name="splitType"]:checked'
	).value;

	let splitBetween = getCheckedSplitPersonIds();

	if (splitBetween.length === 0) {
		alert('Click a box to continue');
		return;
	}

	const customAmounts =
		splitType === 'custom' ? getCustomAmounts(splitBetween) : null;

	if (
		splitType === 'custom' &&
		!splitCalculator.customSplitIsValid(amountValue, customAmounts)
	) {
		alert(`All splits must add to ${amountValue}`);
		return;
	}

	//New Expense Object Properties
	newExpense.id = expenseId;
	newExpense.createdAt = Date.now();
	newExpense.description = expenseName;
	newExpense.amount = amountValue;
	newExpense.paidBy = payer;
	newExpense.category = category;
	newExpense.splitType = splitType;
	newExpense.splitBetween = splitBetween;
	newExpense.customAmounts = customAmounts;

	//Pushing New Expense and Clearing Form Fields
	console.dir(newExpense);
	expenses.push(newExpense);
	renderAll();
	expenseDescription.value = '';
	expenseCategory.value = 'general';
	expenseAmount.value = 0;
});

expensesRows.addEventListener('click', (event) => {
	const clearButton = event.target.closest('.clear-filters-btn');

	if (clearButton) {
		clearFilters();
		return;
	}

	const deleteButton = event.target.closest('.delete-expense-btn');

	if (!deleteButton) return;

	const expenseId = deleteButton.dataset.expenseId;
	deleteExpense(expenseId);
});

//Filter Buttons Event Handlers
expensesPersonFilterSelect.addEventListener('change', handleFilterChange);
expensesCategoryFilterSelect.addEventListener('change', handleFilterChange);
expensesSortSelect.addEventListener('change', handleFilterChange);

clearFilterButton.addEventListener('click', (event) => {
	event.preventDefault();
	clearFilters();
});
