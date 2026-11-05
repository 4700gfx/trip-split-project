/* -------------------- STATE -------------------- */

const stateObj = {
	tripName: 'My Trip',
	members: [
		{ id: 'p1', name: 'Black' },
		{ id: 'p2', name: 'Lou' },
		{ id: 'p3', name: 'Kidd' },
		{ id: 'p4', name: 'Slick' }
	],
	expenses: [
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
	],
	editingId: null,
	filters: {
		personId: 'all',
		category: 'all',
		sortBy: 'date-desc'
	}
};

/* -------------------- DOM REFERENCES (the ONLY place static elements are looked up) -------------------- */

const elements = {
	//DOM Elements for Initial Setup
	tripName: document.querySelector('#tripNameInput'),
	tripNameBadge: document.querySelector('#tripNameBadge'),
	setupMemberName: document.querySelector('#setupPersonNameInput'),
	addPersonButton: document.querySelector('#setupAddPersonBtn'),
	memberCount: document.querySelector('#memberCountBadge'),
	expenseCount: document.querySelector('#expenseCountBadge'),
	totalSpent: document.querySelector('#totalSpentBadge'),
	memberListContainer: document.querySelector('#setupMembersList'),
	setupMemberCountLabel: document.querySelector('#setupMemberCountLabel'),
	setupMemberWarning: document.querySelector('#setupMemberWarning'),
	setupMemberWarningText: document.querySelector('#setupMemberWarningText'),

	//DOM Elements for Adding Expenses
	addExpenseSplitRows: document.querySelector('#addExpenseSplitRows'),

	//DOM Element for Expense Form Input
	addExpenseHeading: document.querySelector('#addExpenseHeading'),
	expenseDescription: document.querySelector(`#addExpenseDescriptionInput`),
	expenseAmount: document.querySelector('#addExpenseAmountInput'),
	expensePayer: document.querySelector('#addExpensePayerSelect'),
	expenseCategory: document.querySelector('#addExpenseCategorySelect'),
	splitEqualRadio: document.querySelector('#addExpenseSplitEqualRadio'),
	splitCustomRadio: document.querySelector('#addExpenseSplitCustomRadio'),
	expenseSplitTableContainer: document.querySelector('#addExpenseSplitTable'),
	addExpenseButton: document.querySelector('#addExpenseSaveBtn'),
	addExpenseCancelButton: document.querySelector('#addExpenseCancelBtn'),

	//DOM Elements for Expense Form Feedback (hidden by default in index.html)
	expenseAmountError: document.querySelector('#addExpenseAmountError'),
	expenseShortfallRow: document.querySelector('#addExpenseShortfallRow'),
	expenseShortfallAmount: document.querySelector('#addExpenseShortfallAmount'),
	expenseProblemsLabel: document.querySelector('#addExpenseProblemsLabel'),
	expenseProblemsText: document.querySelector('#addExpenseProblemsText'),

	//DOM Elements for Expense List
	expensesRows: document.querySelector('#expensesRows'),

	//DOM Elements for Filters
	expensesSearchInput: document.querySelector('#expensesSearchInput'),
	expensesPersonFilterSelect: document.querySelector(
		'#expensesPersonFilterSelect'
	),
	expensesCategoryFilterSelect: document.querySelector(
		'#expensesCategoryFilterSelect'
	),
	expensesSortSelect: document.querySelector('#expensesSortSelect'),
	clearFilterButton: document.querySelector('#expensesClearAllLink'),

	expenseFilterSummary: document.querySelector('#expensesFilterSummary'),
	expenseActiveFilterChips: document.querySelector('#expensesActiveFilterChip'),

	expensesSidebarBalances: document.querySelector(
		'#expensesSidebarBalanceList'
	),
	expensesSidebarBalanceSum: document.querySelector(
		'#expensesSidebarBalanceSum'
	),

	settleUpList: document.querySelector('#settleUpList'),

	//DOM Elements for Summary Page
	summaryTotalSpent: document.querySelector('#summaryTotalSpent'),
	summaryAverageExpense: document.querySelector('#summaryAverageExpense'),
	summaryPerHead: document.querySelector('#summaryPerHead'),
	summaryTopSpender: document.querySelector('#summaryTopSpender'),
	summaryTopSpenderDetail: document.querySelector('#summaryTopSpenderDetail'),
	perHeadBadge: document.querySelector('#perHeadBadge'),
	expensesSidebarTotal: document.querySelector('#expensesSidebarTotal'),
	expensesSidebarMeta: document.querySelector('#expensesSidebarMeta'),

	//DOM Elements for Share Page
	shareSummaryText: document.querySelector('#shareSummaryText'),
	shareCopyButton: document.querySelector('#shareCopyBtn'),
	shareCopiedBadge: document.querySelector('#shareCopiedBadge'),
	shareFallbackWarning: document.querySelector('#shareFallbackWarning')
};

/* ==================== TRIP-2: MEMBERS ==================== */

//Adding and Removing Person to People Object
function addPerson(rawName) {
	const userInput = normalizeName(rawName);

	const alreadyEntered = stateObj.members.some(
		(person) => normalizeName(person.name).trim() === userInput
	);

	if (userInput === '' || !userInput) {
		showMemberWarning('Enter a Name');
		return;
	}

	if (alreadyEntered) {
		showMemberWarning(`${userInput} is already entered on the Trip`);
		return;
	}

	hideMemberWarning();

	const newPerson = {
		id: crypto.randomUUID(),
		name: displayName(userInput)
	};

	//Adding Person Object to People Array
	stateObj.members = [...stateObj.members, newPerson];
	renderAll();
}

function removePerson(personId) {
	const personIdName =
		stateObj.members.find((person) => person.id === personId)?.name ??
		'Unknown';

	//Checcking if the Person has a Balance
	const balanceCount = stateObj.expenses.filter(
		(expense) =>
			expense.splitBetween.includes(personId) || expense.paidBy === personId
	).length;

	if (balanceCount > 0) {
		//Returns if there is no Balance
		showMemberWarning(
			`${personIdName} is in ${balanceCount} ${pluralize(balanceCount, 'expense', 'expenses')}. Delete those expenses first.`
		);
		return;
	} else {
		//Filter the Person and Rerender
		hideMemberWarning();
		stateObj.members = stateObj.members.filter(
			(person) => person.id !== personId
		);
		stateObj.filters.personId = 'all';
		renderAll();
	}
}

//Rending People Chips from People Array
function renderMemberChips() {
	const memberPillRow = stateObj.members
		.map((person) => {
			return `<span data-person="${person.id}" class="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-indigo-50"><span class="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-semibold">${person.name.charAt(0).toUpperCase()}</span>${person.name} <span class="text-slate-400 remove-person-button">×</span></span>`;
		})
		.join('');

	//Adding Elements to Inner HTML
	elements.memberListContainer.innerHTML = memberPillRow;
}

/* ==================== TRIP-3: EXPENSE FORM ==================== */

function populatePayerDropdown() {
	const expensePayers = stateObj.members
		.map((person) => {
			return `<option value='${person.id}'>${person.name}</option>`;
		})
		.join('');

	elements.expensePayer.innerHTML = expensePayers;
}

function populateSplitCheckboxes() {
	const splitRowsHTML = stateObj.members
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

	elements.addExpenseSplitRows.innerHTML = splitRowsHTML;
}

function getCheckedSplitPersonIds() {
	// Rows are rendered by JS, so search INSIDE the static rows container
	const peopleCheckbox = elements.addExpenseSplitRows.querySelectorAll(
		'.split-person-checkbox'
	);
	const peopleCheckboxArr = [...peopleCheckbox];

	//Filtered Checked Boxes
	const checkedPeople = peopleCheckboxArr.filter(
		(checkbox) => checkbox.checked
	);

	return checkedPeople.map((person) => person.dataset.personId);
}

function getCustomAmounts(checkedPersonId) {
	const customAmountObj = checkedPersonId.reduce((accumulator, currentItem) => {
		// Rows are rendered by JS, so search INSIDE the static rows container
		const splitAmount = elements.addExpenseSplitRows.querySelector(
			`.split-person-amount[data-person-id="${currentItem}"]`
		);

		accumulator[currentItem] = Number(splitAmount.value);
		return accumulator;
	}, {});

	return customAmountObj;
}

function validateExpenseForm({
	amountText,
	splitType,
	splitBetween,
	customAmounts
}) {
	const problems = [];
	const amount = parseAmount(amountText);

	//Amount Rule
	if (Number.isNaN(amount)) {
		problems.push({
			field: 'amount',
			message: 'Enter an Amount Greater than Zero'
		});
	}

	//Split People Rule
	if (splitBetween.length < 1) {
		problems.push({ field: 'split', message: 'Pick at least one person' });
	}

	//Split Type Rule
	if (splitType === 'custom') {
		const customValues = Object.values(customAmounts, {});
		const hasBadValue = customValues.some(
			(value) => !Number.isFinite(value) || value < 0
		);

		if (hasBadValue) {
			problems.push({ field: 'custom', message: 'Enter amounts of 0 or more' });
		} else if (
			!Number.isNaN(amount) &&
			!splitCalculator.customSplitIsValid(amount, customAmounts)
		) {
			const difference =
				amount -
				customValues.reduce((acc, currentValue) => acc + currentValue, 0);
			const message =
				difference > 0
					? `${difference.toFixed(2)} short`
					: `${Math.abs(Number(difference.toFixed(2)))} over`;
			problems.push({ field: 'custom', message: message });
		}
	}

	return problems;
}

/* ==================== TRIP-5: SPLIT CALCULATOR ==================== */

const splitCalculator = (() => {
	function equalSplit(amount, memberIds, payerId) {
		const totalCents = Math.round(amount * 100);
		const baseCentShare = Math.floor(totalCents / memberIds.length);
		const leftoverCents = totalCents - baseCentShare * memberIds.length;
		const equalSplitAmount = memberIds.reduce((accumulator, currentMember) => {
			if (currentMember === payerId) {
				accumulator[currentMember] = (baseCentShare + leftoverCents) / 100;
			} else {
				accumulator[currentMember] = baseCentShare / 100;
			}
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
	if (stateObj.expenses.length === 0) {
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
				const payer = stateObj.members.find(
					(person) => expense.paidBy === person.id
				);
				// || (not ??) because a blank description is '' — falsy, but not null
				const descriptionText = expense.description || 'Untitled expense';
				// map + find + join: turn split ids into a readable list of names
				const splitNames = expense.splitBetween
					.map(
						(id) =>
							stateObj.members.find((person) => person.id === id)?.name ??
							'Unknown'
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

	elements.expensesRows.innerHTML = rowsHTML;
	renderFilterSummary(visibleExpenses);
}

function getFilteredSortedExpenses() {
	//Intialize Array for Filtering
	let filteredExpenses;

	//Check The First Active Filter
	if (stateObj.filters.personId === 'all') {
		filteredExpenses = stateObj.expenses;
	} else {
		filteredExpenses = stateObj.expenses.filter((expense) => {
			return (
				stateObj.filters.personId === expense.paidBy ||
				expense.splitBetween.includes(stateObj.filters.personId)
			);
		});
	}

	//Chaining Filter with Another If/Else Block
	if (stateObj.filters.category !== 'all') {
		filteredExpenses = filteredExpenses.filter(
			(expense) => expense.category === stateObj.filters.category
		);
	}

	//Speading Filtered Expenses to Sort Based on Date or Amount
	if (stateObj.filters.sortBy.includes('date')) {
		filteredExpenses =
			stateObj.filters.sortBy === 'date-asc'
				? [...filteredExpenses].sort((a, b) => a.createdAt - b.createdAt)
				: [...filteredExpenses].sort((a, b) => b.createdAt - a.createdAt);
	} else if (stateObj.filters.sortBy.includes('amount')) {
		filteredExpenses =
			stateObj.filters.sortBy === 'amount-asc'
				? [...filteredExpenses].sort((a, b) => a.amount - b.amount)
				: [...filteredExpenses].sort((a, b) => b.amount - a.amount);
	} else {
		filteredExpenses = [...filteredExpenses];
	}

	return filteredExpenses;
}

function deleteExpense(expenseId) {
	// TODO: filter it out, renderAll()
	const filteredExpenses = stateObj.expenses.filter(
		(expense) => expense.id !== expenseId
	);
	stateObj.expenses = filteredExpenses;
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
	const balanceMap = new Map(stateObj.members.map((person) => [person.id, 0]));

	//Reduces Shares into Map
	const balances = stateObj.expenses.reduce((accumulator, expense) => {
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

function renderBalances(balances) {
	const balancesArr = Array.from(balances, ([id, balance]) => ({
		id,
		name:
			stateObj.members.find((person) => person.id === id)?.name || 'Unknown',
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

	elements.expensesSidebarBalances.innerHTML = balancesHTML;

	const balanceSum = sortedBalanceArr.reduce(
		(sum, row) => sum + row.balance,
		0
	);
	const displaySum = Math.abs(balanceSum) < 0.005 ? 0 : balanceSum;
	elements.expensesSidebarBalanceSum.textContent = `sums to ${displaySum.toFixed(2)}`;
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

function renderSettleUp(balances) {
	// TODO: render computeSettlements(computeBalances()); toggle empty state
	const payments = computeSettlements(balances);

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
				const fromName = stateObj.members.find(
					(person) => payment.from === person.id
				)?.name;
				const toName = stateObj.members.find(
					(person) => payment.to === person.id
				)?.name;

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

	elements.settleUpList.innerHTML = settleHTML;
}

/* ==================== TRIP-8: FILTERS ==================== */

function renderFilterSummary(visibleExpenses) {
	const visibleCount = visibleExpenses.length;
	const totalCount = stateObj.expenses.length;
	const shownTotal = visibleExpenses.reduce(
		(sum, expense) => sum + expense.amount,
		0
	);

	elements.expenseFilterSummary.textContent = `${visibleCount} of ${totalCount} expenses · $${shownTotal.toFixed(2)} shown`;

	const expenseLabels = [];

	if (stateObj.filters.personId !== 'all') {
		expenseLabels.push(
			stateObj.members.find((person) => stateObj.filters.personId === person.id)
				?.name || 'Unknown'
		);
	}

	if (stateObj.filters.category !== 'all') {
		expenseLabels.push(initalCapString(stateObj.filters.category));
	}

	if (expenseLabels.length === 0) {
		elements.expenseActiveFilterChips.classList.add('hidden');
	} else {
		elements.expenseActiveFilterChips.classList.remove('hidden');
		elements.expenseActiveFilterChips.textContent = `${expenseLabels.join(' · ')}`;
	}
}

function populateFilterDropdowns() {
	// TODO: rebuild #filterByPerson / #filterByCategory options
	const allSelectOption = `<option value="all">Person: All</option>`;

	const filterDropdowns = stateObj.members
		.map((person) => `<option value="${person.id}">${person.name}</option>`)
		.join('');

	const allOptions = allSelectOption.concat(filterDropdowns);
	elements.expensesPersonFilterSelect.innerHTML = allOptions;
	elements.expensesPersonFilterSelect.value = stateObj.filters.personId;
}

function handleFilterChange() {
	stateObj.filters.personId = elements.expensesPersonFilterSelect.value;
	stateObj.filters.category = elements.expensesCategoryFilterSelect.value;
	stateObj.filters.sortBy = elements.expensesSortSelect.value;

	renderExpenseList();
}

function clearFilters() {
	stateObj.filters.personId = 'all';
	stateObj.filters.category = 'all';
	stateObj.filters.sortBy = 'date-desc';

	elements.expensesPersonFilterSelect.value = stateObj.filters.personId;
	elements.expensesCategoryFilterSelect.value = stateObj.filters.category;
	elements.expensesSortSelect.value = stateObj.filters.sortBy;
	renderExpenseList();
}

/* ==================== TRIP-9: SUMMARY DASHBOARD ==================== */

function computeSummary() {
	const total = stateObj.expenses.reduce(
		(sum, expense) => sum + expense.amount,
		0
	);
	const average =
		stateObj.expenses.length === 0 ? 0 : total / stateObj.expenses.length;
	const perHead =
		stateObj.members.length === 0 ? 0 : total / stateObj.members.length;

	const paidByPerson = stateObj.expenses.reduce((acc, expense) => {
		acc[expense.paidBy] = (acc[expense.paidBy] ?? 0) + expense.amount;
		return acc;
	}, {});

	const entries = Object.entries(paidByPerson);

	const topEntry = [...entries].sort((a, b) => b[1] - a[1])[0];
	const topSpenderId = topEntry?.[0] || null;
	const topSpenderName =
		stateObj.members.find((person) => person.id === topSpenderId)?.name ?? '—';
	const topSpenderAmount = topEntry?.[1] ?? 0;
	const topSpenderCount = stateObj.expenses.filter(
		(expense) => expense.paidBy === topSpenderId
	).length;

	const totalPerCategory = stateObj.expenses.reduce((acc, expense) => {
		acc[expense.category] = (acc[expense.category] ?? 0) + expense.amount;
		return acc;
	}, {});

	return {
		total,
		average,
		perHead,
		topSpenderId,
		topSpenderName,
		topSpenderAmount,
		topSpenderCount,
		totalPerCategory
	};
}

function renderSummary() {
	const summaryObject = computeSummary();
	const {
		total,
		average,
		perHead,
		topSpenderName,
		topSpenderAmount,
		topSpenderCount
	} = summaryObject;

	//Stat Cards
	const totalCard = formatMoney(total);
	const averageCard = formatMoney(average);
	const topSpenderCard = topSpenderName;

	elements.summaryTopSpenderDetail.textContent =
		topSpenderCount === 0
			? 'No Expenses Yet'
			: `${formatMoney(topSpenderAmount)} across ${topSpenderCount} ${pluralize(topSpenderCount, 'expense', 'expenses')}`;
	elements.summaryTotalSpent.textContent = totalCard;
	elements.summaryTopSpender.textContent = topSpenderCard;
	elements.summaryAverageExpense.textContent = averageCard;
	elements.summaryPerHead.textContent = formatMoney(perHead);
	elements.perHeadBadge.textContent = formatMoney(perHead);

	elements.memberCount.textContent = `${stateObj.members.length} ${pluralize(stateObj.members.length, 'person', 'people')}`;
	elements.expenseCount.textContent = `${stateObj.expenses.length} ${pluralize(stateObj.expenses.length, 'expense', 'expenses')}`;
	elements.totalSpent.textContent = totalCard;
	elements.expensesSidebarTotal.textContent = totalCard;
	elements.expensesSidebarMeta.textContent = `${stateObj.expenses.length} ${pluralize(stateObj.expenses.length, 'expense', 'expenses')}, ${stateObj.members.length} ${pluralize(stateObj.members.length, 'person', 'people')}`;
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
	renderMemberChips();
	populatePayerDropdown();
	populateSplitCheckboxes();
	populateFilterDropdowns();
	renderExpenseList();

	const balances = computeBalances();
	renderBalances(balances);
	renderSettleUp(balances);
	renderSummary();
}

/* ==================== RENDER ORCHESTRATION ==================== */

function handleAddPerson() {
	const rawText = elements.setupMemberName.value;

	if (!rawText.trim()) return;

	addPerson(rawText.trim());
	elements.setupMemberName.value = '';
	elements.setupMemberName.focus();
}

function handleMemberNameKey(event) {
	if (event.key !== 'Enter') return;
	handleAddPerson();
}

function handleTripNameInput() {
	const typedTripName = elements.tripName.value.trim();
	stateObj.tripName = !typedTripName ? 'My Trip' : typedTripName;
	elements.tripNameBadge.textContent = stateObj.tripName;
}

function handleSplitTypeChange() {}

function handleExpenseFormSubmit(event) {
	//Initalizing New Expense Object

	const amountText = elements.expenseAmount.value;
	const splitType = elements.splitCustomRadio.checked ? 'custom' : 'equal';
	const splitBetween = getCheckedSplitPersonIds();
	const customAmounts =
		splitType === 'custom' ? getCustomAmounts(splitBetween) : null;
	const payer = elements.expensePayer.value;
	const category = elements.expenseCategory.value;
	const expenseName = elements.expenseDescription.value || 'Untitled Expense';

	const problems = validateExpenseForm({
		amountText,
		splitType,
		splitBetween,
		customAmounts
	});

	if (problems.length > 0) {
		showFormErrors(problems);
		return;
	}

	clearFormErrors();

	const amountValue = parseAmount(amountText);
	//New Expense Object Properties

	const newExpense = buildExpense({
		description: expenseName,
		amount: amountValue,
		paidBy: payer,
		splitType: splitType,
		splitBetween: splitBetween,
		customAmounts: customAmounts,
		category: category || 'General'
	});

	//Pushing New Expense and Clearing Form Fields
	stateObj.expenses = [...stateObj.expenses, newExpense];
	resetExpenseForm();
	renderAll();
}

function handleMemberListClick(event) {
	const deleteButton = event.target.closest('.remove-person-button');

	if (!deleteButton) {
		return;
	}

	const chip = deleteButton.closest('[data-person]');
	const personId = chip.dataset.person;
	removePerson(personId);
}

function handleExpenseRowClick(event) {
	const clearButton = event.target.closest('.clear-filters-btn');

	if (clearButton) {
		clearFilters();
		return;
	}

	const deleteButton = event.target.closest('.delete-expense-btn');

	if (!deleteButton) return;

	const expenseId = deleteButton.dataset.expenseId;
	deleteExpense(expenseId);
}

function handleClearFiltersClick(event) {
	event.preventDefault();
	clearFilters();
}

/* ==================== HELPER FUNCTIONS ==================== */

function normalizeName(raw) {
	return raw.trim().toLowerCase();
}

function displayName(raw) {
	const trimmedName = raw.trim();
	return trimmedName[0].toUpperCase() + trimmedName.slice(1).toLowerCase();
}

function showMemberWarning(message) {
	elements.setupMemberWarningText.textContent = message;
	elements.setupMemberWarning.classList.remove('hidden');
}

function hideMemberWarning() {
	elements.setupMemberWarning.classList.add('hidden');
}

function initalCapString(name) {
	if (!name) return;
	return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

function formatMoney(amount) {
	const safeAmount = Math.abs(amount) < 0.005 ? 0 : amount;
	return safeAmount.toLocaleString('en-us', {
		style: 'currency',
		currency: 'USD'
	});
}

function pluralize(count, singular, plural) {
	return count === 1 ? `${singular}` : `${plural}`;
}

function parseAmount(rawText) {
	const cleanedText = rawText.trim();

	if (cleanedText === '') {
		return Number.NaN;
	}

	const parsedAmount = Number(cleanedText);

	if (!Number.isFinite(parsedAmount)) {
		return Number.NaN;
	}

	const roundedAmount = Number(parsedAmount.toFixed(2));

	if (roundedAmount <= 0) {
		return Number.NaN;
	}

	return roundedAmount;
}

function checkElements() {
	const missing = [];

	Object.entries(elements).forEach(([key, value]) => {
		if (value === null) {
			missing.push(key);
		}
	});

	if (missing.length > 0) {
		console.error('Missing Elements:', missing.join(', '));
	}

	return missing;
}

function clearFormErrors() {
	elements.expenseAmountError.classList.add('hidden');
	elements.expenseShortfallRow.classList.add('hidden');
	elements.expenseProblemsLabel.classList.add('hidden');
}

function showFormErrors(problems) {
	clearFormErrors();

	const customProblem = problems.some((problem) => problem.field === 'custom');
	const amountProblem = problems.some((problem) => problem.field === 'amount');

	if (amountProblem) {
		elements.expenseAmountError.classList.remove('hidden');
	}

	if (customProblem) {
		elements.expenseShortfallAmount.textContent = customProblem;
		elements.expenseShortfallRow.classList.remove('hidden');
	}

	elements.expenseProblemsText.textContent = `${problems.length} problem(s) to fix`;

	elements.expenseProblemsLabel.classList.remove('hidden');
}

function buildExpense({
	description,
	amount,
	paidBy,
	splitBetween,
	splitType,
	customAmounts,
	category = 'general'
}) {
	return {
		id: crypto.randomUUID(),
		createdAt: Date.now(),
		description: description || 'Untitied Expenses',
		amount: amount,
		paidBy: paidBy,
		category: category,
		splitType: splitType,
		splitBetween: splitBetween,
		customAmounts: customAmounts
	};
}

function resetExpenseForm() {
	elements.expenseDescription.value = '';
	elements.expenseCategory.value = 'general';
	elements.expenseAmount.value = '';
}

/* ==================== EVENT WIRING ==================== */
function init() {
	checkElements();
	wireEvents();
	elements.tripName.value = stateObj.tripName;
	elements.tripNameBadge.textContent = stateObj.tripName;
	renderAll();
}

document.addEventListener('DOMContentLoaded', init);

//Event Listeners for Setting Up Expenses and Trip
function wireSetupEvents() {
	//Adding a Person
	elements.addPersonButton.addEventListener('click', handleAddPerson);

	//Adding Person Name and Trip Name
	elements.setupMemberName.addEventListener('keydown', handleMemberNameKey);
	elements.tripName.addEventListener('input', handleTripNameInput);

	//Deleting a Member from Expense
	elements.memberListContainer.addEventListener('click', handleMemberListClick);
}

function wireExpenseFormEvents() {
	//Adding Expenses
	elements.addExpenseButton.addEventListener('click', handleExpenseFormSubmit);

	//Event Listeners for Custom and Equal Splits
	elements.splitEqualRadio.addEventListener('change', handleSplitTypeChange);
	elements.splitCustomRadio.addEventListener('change', handleSplitTypeChange);
	elements.addExpenseCancelButton.addEventListener(
		'click',
		cancelEditingExpense
	);
}

//Event Listeners for List Events
function wireExpenseListEvents() {
	// Removes Expenses
	elements.expensesRows.addEventListener('click', handleExpenseRowClick);
}

//Event Listeners for Filter Events
function wireFilterEvents() {
	//Filter Buttons Event Handlers
	elements.expensesPersonFilterSelect.addEventListener(
		'change',
		handleFilterChange
	);
	elements.expensesCategoryFilterSelect.addEventListener(
		'change',
		handleFilterChange
	);
	elements.expensesSortSelect.addEventListener('change', handleFilterChange);
	elements.clearFilterButton.addEventListener('click', handleClearFiltersClick);
}

function wireShareEvents() {
	elements.shareCopyButton.addEventListener('click', handleCopySummary);
}

function wireEvents() {
	wireSetupEvents();
	wireExpenseFormEvents();
	wireExpenseListEvents();
	wireFilterEvents();
	wireShareEvents();
}
