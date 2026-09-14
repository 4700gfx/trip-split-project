# TripSplit — DOM Reference

Every `id` and `data-*` hook in `index.html`, grouped by the ticket that owns
it. Use this instead of re-opening the HTML every time you need an element name
in `script.js`.

## Header (badges only — no ticket owns these directly, updated by `renderAll()`)

| ID                  | Element   | Notes              |
| ------------------- | --------- | ------------------ |
| `tripNameInput`     | `<input>` | editable trip name |
| `memberCountBadge`  | `<span>`  | "N people"         |
| `expenseCountBadge` | `<span>`  | "N expenses"       |
| `totalSpentBadge`   | `<span>`  | "$X total"         |

## TRIP-2 — Members

| ID                    | Element    | Notes                                          |
| --------------------- | ---------- | ---------------------------------------------- |
| `addPersonForm`       | `<form>`   | submit → `addPerson()`                         |
| `personNameInput`     | `<input>`  | new name field                                 |
| `addPersonBtn`        | `<button>` | submit button                                  |
| `membersList`         | `<div>`    | render target; each chip gets `data-person-id` |
| `memberWarning`       | `<p>`      | hidden unless removal is blocked               |
| `noMembersEmptyState` | `<p>`      | hidden unless `people.length === 0`            |

## TRIP-3 — Expense form

| ID                        | Element                 | Notes                                              |
| ------------------------- | ----------------------- | -------------------------------------------------- |
| `expenseFormSection`      | `<section>`             | wrapper                                            |
| `editingBadge`            | `<span>`                | shown only while editing                           |
| `expenseForm`             | `<form>`                | submit → `handleExpenseFormSubmit()`               |
| `editingExpenseId`        | `<input type="hidden">` | empty = new expense, set = editing                 |
| `expenseDescription`      | `<input>`               | defaults to "Untitled expense" if blank            |
| `expenseAmount`           | `<input>`               | validate with `Number.isFinite`/`isNaN`            |
| `expenseAmountError`      | `<p>`                   | inline error target                                |
| `expensePayer`            | `<select>`              | options rebuilt by `populatePayerDropdown()`       |
| `expenseCategory`         | `<select>`              | static options, already in HTML                    |
| `splitBetweenCheckboxes`  | `<div>`                 | render target; each checkbox gets `data-person-id` |
| `splitBetweenError`       | `<p>`                   | shown if zero people selected                      |
| `submitExpenseBtn`        | `<button>`              | "Save expense"                                     |
| `cancelEditBtn`           | `<button>`              | hidden unless editing                              |
| `expenseFormGeneralError` | `<p>`                   | catch-all form error                               |

## TRIP-5 — Split type / custom split

| ID                                         | Element       | Notes                                                                         |
| ------------------------------------------ | ------------- | ----------------------------------------------------------------------------- |
| `splitTypeEqualLabel` / `splitTypeEqual`   | label / radio | value `"equal"`                                                               |
| `splitTypeCustomLabel` / `splitTypeCustom` | label / radio | value `"custom"`                                                              |
| `customSplitInputs`                        | `<div>`       | hidden unless Custom selected; build one number input per checked person here |
| `customSplitTotalHint`                     | `<p>`         | live "X of Y · Z short/over" message                                          |

## TRIP-4 / TRIP-8 — Expense list & filters

| ID                        | Element    | Notes                                                |
| ------------------------- | ---------- | ---------------------------------------------------- |
| `filterByPerson`          | `<select>` | options rebuilt by `populateFilterDropdowns()`       |
| `filterByCategory`        | `<select>` | same                                                 |
| `sortExpenses`            | `<select>` | static options                                       |
| `clearFiltersBtn`         | `<button>` | → `clearFilters()`                                   |
| `expenseList`             | `<div>`    | render target; each row gets `data-expense-id`       |
| `expenseListEmptyState`   | `<div>`    | shown when `expenses.length === 0`                   |
| `expenseListNoMatchState` | `<div>`    | shown when filters return nothing but expenses exist |

## TRIP-6 — Balances

| ID                   | Element | Notes                                         |
| -------------------- | ------- | --------------------------------------------- |
| `balanceList`        | `<div>` | render target; each row gets `data-person-id` |
| `balancesEmptyState` | `<p>`   | shown when `expenses.length === 0`            |

## TRIP-7 — Settle up

| ID                   | Element | Notes                                        |
| -------------------- | ------- | -------------------------------------------- |
| `settleUpList`       | `<div>` | render target; one row per suggested payment |
| `settleUpEmptyState` | `<p>`   | shown when all balances are ~0               |

## TRIP-9 — Summary dashboard

| ID                      | Element | Notes                                                                                    |
| ----------------------- | ------- | ---------------------------------------------------------------------------------------- |
| `summaryTotalSpent`     | `<dd>`  |                                                                                          |
| `summaryAverageExpense` | `<dd>`  |                                                                                          |
| `summaryTopSpender`     | `<dd>`  |                                                                                          |
| `summaryPerHead`        | `<dd>`  |                                                                                          |
| `categoryBreakdown`     | `<div>` | render target; one bar per category — set width via `.style.width`, not a Tailwind class |

## TRIP-11 — Share / export

| ID                 | Element    | Notes                                    |
| ------------------ | ---------- | ---------------------------------------- |
| `shareSummaryText` | `<pre>`    | holds `buildShareText()` output          |
| `copySummaryBtn`   | `<button>` | → `handleCopySummary()`                  |
| `copyFeedback`     | `<p>`      | shown on successful copy                 |
| `copyFallback`     | `<p>`      | shown if Clipboard API fails/unavailable |

## `data-*` attributes (not ids, but load-bearing for event delegation)

| Attribute         | Where                                                                                    | Used for                                                          |
| ----------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `data-person-id`  | chips in `#membersList`, checkboxes in `#splitBetweenCheckboxes`, rows in `#balanceList` | identifying which person a delegated click/change came from       |
| `data-expense-id` | rows in `#expenseList`                                                                   | identifying which expense a delegated edit/delete click came from |
