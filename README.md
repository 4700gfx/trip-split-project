# TripSplit

A group expense splitter for trips. Add the people on a trip, log who paid for
what, split each expense equally or with custom amounts, and TripSplit works out
each person's balance and the smallest set of payments needed to settle up.

Built with HTML5, Tailwind CSS (CDN), and vanilla JavaScript. All state lives in
memory, so a page refresh resets it to the sample data. Course project for
**Advanced JavaScript & DOM Engineering**.

---

## Features

| Area                          | What it does                                                                                                              | Status                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| **Members** (TRIP-2)          | Add people (names are auto-capitalised, duplicates and blanks rejected); render as chips; remove a person                 | Working (see Known issues)                |
| **Expense form** (TRIP-3)     | Description (blank saves as "Untitled expense"), amount, payer, category, split-between checkboxes                        | Working via the Save button click handler |
| **Split calculator** (TRIP-5) | Equal split in integer cents (remainder goes to the payer); custom split validated to within 1 cent                       | Working                                   |
| **Expense list** (TRIP-4)     | Rendered rows with payer avatar, category, split names, amount, delete; empty state and "no matches" state                | Working; edit mode not built              |
| **Balances** (TRIP-6)         | Net balance per person (positive = owed money, negative = owes), with proportional bars and a "sums to" check             | Working                                   |
| **Settle up** (TRIP-7)        | Greedy algorithm pairing the largest creditor with the largest debtor                                                     | Working                                   |
| **Filters and sort** (TRIP-8) | Filter by person and category, sort by date or amount, active-filter chip, "N of M expenses shown" summary, clear filters | Working                                   |
| **Summary** (TRIP-9)          | Total, average expense, per-head share, top spender; header and sidebar badges                                            | Working; category bars not built          |
| **Share / export** (TRIP-11)  | Copy a plain-text summary to the clipboard                                                                                | Not started                               |

---

## Getting started

No build step.

1. Put `index.html` and `script.js` in the same folder.
2. Open `index.html` in a browser (or use a local server such as VS Code Live
   Server).
3. The app loads with four sample people (Black, Lou, Kidd, Slick) and five
   sample expenses.

Tailwind is loaded from its CDN, so you need an internet connection on first
load.

---

## Project structure

```
tripsplit/
├── index.html      # the working app
├── mockup.html     # static 8-screen design reference (hard-coded data)
├── script.js       # all app logic
├── README.md       # this file
└── docs/
    ├── ARCHITECTURE.md   # state, function reference, algorithms
    ├── DOM_REFERENCE.md  # element IDs script.js depends on
    └── TESTING.md        # expected-value tables and manual test checklist
```

---

## How it works (short version)

1. **State** is two arrays (`people`, `expenses`) plus an `activeFilters`
   object.
2. Every change to state ends with `renderAll()`, which re-renders every section
   from the arrays. Nothing reads the DOM as a source of truth except the
   expense form.
3. **Balances** are computed from scratch on every render: each payer is
   credited the full amount, and each person in the split is debited their
   share.
4. **Settle-up** takes the balances and repeatedly matches the biggest creditor
   with the biggest debtor until everyone is at zero.
5. Row-level buttons (delete, clear filters, remove person) use **event
   delegation** on their container.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for details.

---

## Sample data

The seed data in `script.js` is designed to exercise edge cases:

| Expense              | Amount  | Case it covers                                                            |
| -------------------- | ------- | ------------------------------------------------------------------------- |
| Groceries            | $60.00  | Clean equal split (15.00 each), baseline                                  |
| Taxi to airport      | $37.00  | 37 / 3 doesn't divide evenly; remainder goes to the payer; Black excluded |
| Museum tickets       | $42.50  | Custom split that sums exactly                                            |
| _(blank)_            | $18.75  | Blank description renders as "Untitled expense"; two-person rounding      |
| Dinner — Lou's treat | $100.00 | Custom split where the payer is also in the split                         |

---

## Known issues

These are bugs in the current `script.js`. They are listed here so they can be
tracked, not fixed in this document.

1. **`addNewExpenseButton` is never defined.** The line
   `addNewExpenseButton.addEventListener(...)` throws a `ReferenceError` at
   load, which stops every event listener registered after it (the expense-list
   delegation and all filter listeners). Define the element or remove the
   placeholder.
2. **`removePerson` never blocks removal.** It checks
   `balancesIncludedCount.length === 0`, but `balancesIncludedCount` is already
   a number (the result of `.length`). It should compare the number itself to
   `0`, and the block should happen when the count is **greater** than zero. As
   written, the alert branch is unreachable and the else branch always removes
   the person.
3. **`removePerson` is called twice per click.** The members-list click handler
   calls `removePerson(personId)` and then `renderAll()`, but `removePerson`
   already re-renders.
4. **`paidBy.includes(personId)`** in `removePerson` should be
   `paidBy === personId` (it works on strings by accident, but is the wrong
   check).
5. **`parseAmount` has two bugs.** It returns the string `'Invalid'` instead of
   `NaN`, and it checks `parseAmount < 0` (the function itself) instead of
   `parsedAmount <= 0`. `validateExpenseForm` then tests
   `Number.isNaN(amount) || amount === undefined`, which `'Invalid'` passes, so
   bad amounts get through.
6. **`validateExpenseForm` split rule:** `splitBetween.length < 0` can never be
   true. It should be `=== 0`. The function is also not yet called by the Save
   handler, which does its own inline validation.
7. **The Save handler accepts zero and negative amounts.** It only checks
   `Number.isNaN(amountValue)`. It also resets the amount field to `0` after
   saving rather than an empty string.
8. **Equal split when the payer is not in the split.** `equalSplit` hands the
   leftover cents to the payer only if the payer is one of `memberIds`. If not,
   those cents are dropped, so balances can fail to sum to 0.00 by a cent.
9. **Floating-point balances.** Balances are summed in dollars, not cents, so
   tiny drifts (for example 0.0000001) are possible. `formatMoney` and the 0.005
   / 0.01 thresholds hide most of this.
10. **`renderBalances` amount text has no `$`** (it shows `+15.00`, not
    `+$15.00`).
11. **`renderAll()` rebuilds the split checkboxes and payer dropdown**, which
    clears any half-filled split inputs and the selected payer whenever state
    changes (adding or removing a person, deleting an expense).
12. **`computeBalances()` runs once at top level** (`const result = ...` plus a
    `console.log`). It's leftover debugging and can be removed.
13. **DOM IDs follow `mockup.html`, not the original DOM reference.** See
    `docs/DOM_REFERENCE.md`.
14. **Custom split error message** in `validateExpenseForm` uses `toFixed(0)`
    for "short" and `toFixed(2)` for "over"; they should match.
15. **Unused or unfinished:** `handleExpenseFormSubmit`, `startEditingExpense`,
    `cancelEditingExpense`, `buildShareText`, `handleCopySummary`, and the
    `DOMContentLoaded` wiring are still TODO stubs.

---

## Roadmap

- [ ] Fix the Known issues above (1 and 2 first)
- [ ] Move the Save-button logic into `handleExpenseFormSubmit` using
      `validateExpenseForm`
- [ ] Edit mode (`startEditingExpense` / `cancelEditingExpense`)
- [ ] Category breakdown bars on the summary (`.style.width`, not an
      interpolated Tailwind class)
- [ ] Share / export (`buildShareText`, `handleCopySummary`, clipboard fallback)
- [ ] Live custom-split hint ("X of Y · Z short/over")
- [ ] Persist state (localStorage) — out of scope for the current course ticket
      set

---

## Course info

- **Course:** Advanced JavaScript & DOM Engineering, Open Source State
  University
- **Tickets:** TRIP-1 through TRIP-12

# TripSplit — Architecture

## 1. State

All state is module-level in `script.js`.

```js
people:   [{ id, name }]
expenses: [{
  id, createdAt,            // createdAt = Date.now() timestamp
  description,              // '' or blank → shown as "Untitled expense"
  amount,                   // number, dollars
  paidBy,                   // person id
  category,                 // 'food' | 'transport' | 'activities' | 'general' | ...
  splitType,                // 'equal' | 'custom'
  splitBetween,             // [person ids]
  customAmounts             // { personId: amount } for custom, otherwise null
}]
activeFilters: { personId: 'all', category: 'all', sortBy: 'date-desc' }
```

`sortBy` values: `date-desc`, `date-asc`, `amount-desc`, `amount-asc`.

IDs: seed data uses `p1..p4` / `e1..e5`; new records use `crypto.randomUUID()`.

## 2. Data flow

```
user action → mutate people / expenses / activeFilters → renderAll() → DOM
```

`renderAll()` calls, in order:
`renderMemberChips → renderExpenseList → renderBalances → renderSettleUp → populatePayerDropdown → populateSplitCheckboxes → populateFilterDropdowns → renderSummary`.

Filter changes call only `renderExpenseList()` (which calls
`renderFilterSummary`), because filters don't affect balances or totals.

## 3. Function reference

### Members (TRIP-2)

| Function                 | Purpose                                                                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `addPerson(rawName)`     | Normalises with `initalCapString`, rejects blank and duplicate names (alert), pushes `{id, name}`, `renderAll()`                                             |
| `removePerson(personId)` | Intended: block removal if the person appears in any expense as payer or in `splitBetween`; otherwise filter out and re-render. See README Known issues #2–4 |
| `renderMemberChips()`    | Builds the chips in `#setupMembersList`; each chip has `data-person`                                                                                         |

### Expense form (TRIP-3)

| Function                         | Purpose                                                                                                  |
| -------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `populatePayerDropdown()`        | Rebuilds payer `<option>`s from `people`                                                                 |
| `populateSplitCheckboxes()`      | Renders one row per person (checkbox, name, custom-amount input, share cell) into `#addExpenseSplitRows` |
| `getCheckedSplitPersonIds()`     | Returns the ids of checked `.split-person-checkbox` boxes                                                |
| `getCustomAmounts(ids)`          | Reads `.split-person-amount` inputs into `{ id: Number }`                                                |
| `validateExpenseForm({...})`     | Returns an array of `{ field, message }` problems. Not yet wired into the Save handler                   |
| `handleExpenseFormSubmit(event)` | TODO stub. The Save button currently uses an inline click handler at the bottom of the file              |

### Split calculator (TRIP-5) — `splitCalculator` (IIFE)

| Function                                    | Purpose                                                                                                                               |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `equalSplit(amount, memberIds, payerId)`    | Works in integer cents. Each member gets `floor(total / n)`; leftover cents are added to the payer's share. Returns `{ id: dollars }` |
| `customSplitIsValid(amount, customAmounts)` | Sums the custom values and returns `Math.abs(sum - amount) < 0.01`. Takes the **object** of custom amounts                            |

> `validateExpenseForm` passes `Object.values(...)` (an array) to
> `customSplitIsValid`, which then calls `Object.values` on it again. This works
> for arrays, but the argument type is inconsistent between callers.

### Expense list (TRIP-4 / TRIP-8)

| Function                                             | Purpose                                                                                                           |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `renderExpenseList()`                                | Three states: no expenses (empty state + "Add expense" button), no filter matches (clear-filters button), or rows |
| `getFilteredSortedExpenses()`                        | Filters by person (payer **or** in split), then category, then sorts a copy of the array                          |
| `deleteExpense(id)`                                  | Filters the expense out and re-renders                                                                            |
| `startEditingExpense(id)` / `cancelEditingExpense()` | TODO stubs                                                                                                        |

### Balances (TRIP-6)

| Function            | Purpose                                                                                                                                                                 |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `computeBalances()` | Returns `Map<personId, balance>`. For each expense: payer `+= amount`; each person in `splitBetween` `-= their share`. Shares come from `customAmounts` or `equalSplit` |
| `renderBalances()`  | Sorts descending, draws a coloured bar per person scaled to the largest absolute balance, and shows "sums to X.XX"                                                      |

Sign convention: **positive = owed money (creditor), negative = owes money
(debtor)**.

### Settle-up (TRIP-7)

| Function                          | Purpose                                                       |
| --------------------------------- | ------------------------------------------------------------- |
| `computeSettlements(balancesMap)` | Greedy matching (see below). Returns `[{ from, to, amount }]` |
| `renderSettleUp()`                | Renders payment rows or the "Everyone's square" empty state   |

### Filters (TRIP-8)

| Function                       | Purpose                                                            |
| ------------------------------ | ------------------------------------------------------------------ |
| `populateFilterDropdowns()`    | Rebuilds the person filter, keeping the current selection          |
| `handleFilterChange()`         | Copies the three selects into `activeFilters`, re-renders the list |
| `clearFilters()`               | Resets state and the three selects                                 |
| `renderFilterSummary(visible)` | "N of M expenses · $X shown" and the active-filter chip            |

### Summary (TRIP-9)

| Function           | Purpose                                                                                                                    |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `computeSummary()` | Returns `total`, `average` (per expense), `perHead` (total / people), top spender (by amount paid), and `totalPerCategory` |
| `renderSummary()`  | Writes stat cards, header badges, and sidebar totals                                                                       |

### Share (TRIP-11)

`buildShareText()` and `handleCopySummary()` are TODO stubs.

### Helpers

| Function                             | Purpose                                                                                  |
| ------------------------------------ | ---------------------------------------------------------------------------------------- |
| `initalCapString(name)`              | First letter upper, rest lower. Returns `undefined` for falsy input                      |
| `formatMoney(amount)`                | USD currency string; values within half a cent of zero show as `$0.00` (avoids `-$0.00`) |
| `pluralize(count, singular, plural)` | Picks singular only when `count === 1`                                                   |
| `parseAmount(rawText)`               | Trims and parses text to a 2-decimal number; see Known issues #5                         |

## 4. Algorithms

### Equal split with remainder

Work in cents so the shares always add up exactly.

```
total cents = round(amount × 100)
base        = floor(total / n)
leftover    = total − base × n
payer's share = base + leftover   (everyone else = base)
```

Worked example, Taxi $37.00 split three ways, Lou pays: total 3700, base 1233,
leftover 1 → Lou 12.34, Kidd 12.33, Slick 12.33 (sum 37.00).

### Balance engine

```
for each expense:
    balance[payer] += amount
    for each person in splitBetween:
        balance[person] -= share[person]
```

The payer is credited the whole amount and then debited their own share if
they're in the split. All balances always sum to 0 (if shares sum to the amount;
see Known issue #8).

### Settle-up (greedy)

```
drop balances with |balance| ≤ 0.01
sort descending
while more than one person remains:
    creditor = first, debtor = last
    pay = min(creditor.balance, |debtor.balance|)
    record debtor → creditor for pay
    creditor.balance −= pay; debtor.balance += pay
    remove whoever reached ~0
```

This produces at most `n − 1` payments. It isn't guaranteed to be the true
minimum for every input, but is the standard approach for this kind of app.

## 5. Event wiring

All listeners are at the bottom of `script.js`.

| Target                           | Event                                | Action                                                                         |
| -------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------ |
| `#setupAddPersonBtn`             | click                                | Validate name, `addPerson`, clear input                                        |
| `#setupMembersList`              | click (delegated on `[data-person]`) | `removePerson`                                                                 |
| `#addExpenseSaveBtn`             | click                                | Read fields, validate, push expense, `renderAll`, reset fields                 |
| `#expensesRows`                  | click (delegated)                    | `.clear-filters-btn` → `clearFilters`; `.delete-expense-btn` → `deleteExpense` |
| Person / category / sort selects | change                               | `handleFilterChange`                                                           |
| `#expensesClearAllLink`          | click                                | `preventDefault`, `clearFilters`                                               |
| `document`                       | `DOMContentLoaded`                   | `renderAll()` (the wiring TODO is still open)                                  |

Because the expense rows are re-rendered constantly, delegation on the container
is used instead of per-row listeners.

# TripSplit — DOM Reference (as used by `script.js`)

`script.js` currently selects elements using the IDs from **`mockup.html`** (the
`setup…`, `addExpense…`, `expenses…`, `summary…` names), not the shorter IDs in
the original DOM reference (`personNameInput`, `expenseList`, etc.). If
`index.html` was built from the mockup, these are the IDs that must exist. If
any are missing, `querySelector` returns `null` and the first use throws.

## Header / info bar

| ID                  | Used by              | Notes                    |
| ------------------- | -------------------- | ------------------------ |
| `tripNameInput`     | cached as `tripName` | not yet read or written  |
| `memberCountBadge`  | `renderSummary`      | "N people"               |
| `expenseCountBadge` | `renderSummary`      | "N expenses"             |
| `totalSpentBadge`   | `renderSummary`      | formatted total          |
| `perHeadBadge`      | `renderSummary`      | formatted per-head share |

## Members (setup screen)

| ID                     | Used by                                                                |
| ---------------------- | ---------------------------------------------------------------------- |
| `setupPersonNameInput` | add-person click handler                                               |
| `setupAddPersonBtn`    | add-person click handler                                               |
| `setupMembersList`     | `renderMemberChips`, delegated remove-click; chips carry `data-person` |

## Add expense

| ID                                 | Used by                                                   |
| ---------------------------------- | --------------------------------------------------------- |
| `addExpenseDescriptionInput`       | Save handler                                              |
| `addExpenseAmountInput`            | Save handler                                              |
| `addExpensePayerSelect`            | `populatePayerDropdown`, Save handler                     |
| `addExpenseCategorySelect`         | Save handler                                              |
| `addExpenseSplitRows`              | `populateSplitCheckboxes` render target                   |
| `addExpenseSplitTable`             | cached, not yet used                                      |
| `addExpenseSaveBtn`                | Save click handler                                        |
| `input[name="splitType"]` (radios) | Save handler reads the checked value (`equal` / `custom`) |

Classes generated inside the split rows: `.split-person-checkbox`,
`.split-person-amount`, `.split-person-share`, each with `data-person-id`.

## Expenses list, filters, sidebar

| ID                             | Used by                                                                    |
| ------------------------------ | -------------------------------------------------------------------------- |
| `expensesRows`                 | `renderExpenseList`, delegated click handler; rows carry `data-expense-id` |
| `expensesPersonFilterSelect`   | `populateFilterDropdowns`, `handleFilterChange`                            |
| `expensesCategoryFilterSelect` | `handleFilterChange`, `clearFilters`                                       |
| `expensesSortSelect`           | `handleFilterChange`, `clearFilters`                                       |
| `expensesClearAllLink`         | clear-filters click                                                        |
| `expensesFilterSummary`        | `renderFilterSummary` ("N of M expenses · $X shown")                       |
| `expensesActiveFilterChip`     | `renderFilterSummary` (toggles `hidden`)                                   |
| `expensesSidebarBalanceList`   | `renderBalances`                                                           |
| `expensesSidebarBalanceSum`    | `renderBalances` ("sums to X.XX")                                          |
| `expensesSidebarTotal`         | `renderSummary`                                                            |
| `expensesSidebarMeta`          | `renderSummary`                                                            |

Classes generated in rows: `.delete-expense-btn` (with `data-expense-id`),
`.clear-filters-btn`, `.tab-btn` (empty-state button,
`data-target="screen-02"`).

## Settle up

| ID             | Used by          |
| -------------- | ---------------- |
| `settleUpList` | `renderSettleUp` |

## Summary

| ID                        | Used by                                  |
| ------------------------- | ---------------------------------------- |
| `summaryTotalSpent`       | `renderSummary`                          |
| `summaryAverageExpense`   | `renderSummary`                          |
| `summaryPerHead`          | `renderSummary`                          |
| `summaryTopSpender`       | `renderSummary`                          |
| `summaryTopSpenderDetail` | `renderSummary` ("$X across N expenses") |

## Referenced but not defined

| Name                  | Where                 | Problem                                         |
| --------------------- | --------------------- | ----------------------------------------------- |
| `addNewExpenseButton` | bottom of `script.js` | No `const` declaration, throws `ReferenceError` |

## Not yet wired (from the original reference)

`categoryBreakdown` / `summaryCategoryBreakdown` (bars), `shareSummaryText`,
`copySummaryBtn` / `shareCopyBtn`, `copyFeedback` / `shareCopiedBadge`,
`copyFallback` / `shareFallbackWarning`, `editingExpenseId`, `editingBadge`,
`cancelEditBtn`, `customSplitInputs`, `customSplitTotalHint`.

## `data-*` hooks

| Attribute         | Where                                      | Purpose                                                     |
| ----------------- | ------------------------------------------ | ----------------------------------------------------------- |
| `data-person`     | chips in `#setupMembersList`, balance rows | identify the person in delegated clicks                     |
| `data-person-id`  | split rows, checkboxes, amount inputs      | link inputs to a person                                     |
| `data-expense-id` | expense rows and delete buttons            | identify the expense                                        |
| `data-target`     | `.tab-btn`                                 | screen to switch to (tab navigation not yet in `script.js`) |

# TripSplit — Testing

## 1. Expected values for the seed data

People: Black, Lou, Kidd, Slick. Five expenses, total **$258.25**.

### Each expense's shares

| Expense                      | Paid by | Amount | Shares                              |
| ---------------------------- | ------- | ------ | ----------------------------------- |
| Groceries (equal, 4)         | Lou     | 60.00  | 15.00 each                          |
| Taxi (equal, Lou/Kidd/Slick) | Lou     | 37.00  | Lou 12.34, Kidd 12.33, Slick 12.33  |
| Museum (custom)              | Lou     | 42.50  | Lou 15.00, Kidd 12.50, Slick 15.00  |
| Untitled (equal, Lou/Slick)  | Slick   | 18.75  | Slick 9.38, Lou 9.37                |
| Dinner (custom)              | Lou     | 100.00 | Black 20, Lou 40, Kidd 20, Slick 20 |

### Final balances (positive = owed)

| Person  | Paid   | Owes  | Balance     |
| ------- | ------ | ----- | ----------- |
| Lou     | 239.50 | 91.71 | **+147.79** |
| Black   | 0.00   | 35.00 | **−35.00**  |
| Kidd    | 0.00   | 59.83 | **−59.83**  |
| Slick   | 18.75  | 71.71 | **−52.96**  |
| **Sum** |        |       | **0.00**    |

### Settle-up output

| From  | To  | Amount |
| ----- | --- | ------ |
| Kidd  | Lou | $59.83 |
| Slick | Lou | $52.96 |
| Black | Lou | $35.00 |

### Summary cards

| Card            | Expected                       |
| --------------- | ------------------------------ |
| Total spent     | $258.25                        |
| Average expense | $51.65                         |
| Per head        | $64.56                         |
| Top spender     | Lou, $239.50 across 4 expenses |

## 2. Unit checks (run in the browser console)

| Call                                                                | Expected                     |
| ------------------------------------------------------------------- | ---------------------------- |
| `splitCalculator.equalSplit(60, ['p1','p2','p3','p4'], 'p2')`       | each 15                      |
| `splitCalculator.equalSplit(37, ['p2','p3','p4'], 'p2')`            | p2 12.34, p3 12.33, p4 12.33 |
| `splitCalculator.equalSplit(18.75, ['p2','p4'], 'p4')`              | p4 9.38, p2 9.37             |
| `splitCalculator.customSplitIsValid(42.5, {p2:15, p3:12.5, p4:15})` | `true`                       |
| `splitCalculator.customSplitIsValid(42.5, {p2:15, p3:12.5, p4:14})` | `false`                      |
| `initalCapString('sLICK')`                                          | `'Slick'`                    |
| `pluralize(1, 'expense', 'expenses')`                               | `'expense'`                  |
| `formatMoney(-0.001)`                                               | `'$0.00'`                    |

## 3. Manual checklist

**Members**

- [ ] Add "zoe" → chip shows "Zoe"
- [ ] Add "Zoe" again → duplicate alert
- [ ] Add blank → alert
- [ ] Remove a person who is in an expense → should be blocked (currently fails,
      Known issue #2)
- [ ] Add a person, then remove them (no expenses) → chip disappears

**Expense form**

- [ ] Blank description saves as "Untitled expense"
- [ ] No box checked → alert
- [ ] Amount `abc` → rejected
- [ ] Amount `0` or `-5` → should be rejected (currently accepted, Known issue
      #7)
- [ ] Custom split that doesn't sum to the amount → rejected
- [ ] Custom split that sums exactly → saved

**List and filters**

- [ ] Filter by Black → shows Groceries, Dinner (Black is in those splits)
- [ ] Filter by category "food" → Groceries and Dinner
- [ ] Person + category together narrow the result
- [ ] Sort by amount high → Dinner first
- [ ] Filter with no matches → "Nothing matches these filters" with a working
      Clear button
- [ ] Delete every expense → "No expenses yet" state, balances all 0, settle-up
      shows "Everyone's square"

**Balances and settle-up**

- [ ] Balances match the table above and "sums to 0.00"
- [ ] After deleting an expense, all totals and badges update
- [ ] Adding a new person with no expenses shows a 0.00 balance
