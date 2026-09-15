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

---

# `mockup.html` reference (static design mockup, 8 screens)

This is a separate file from `index.html` — a static visual reference with
hard-coded example data, not the working app. IDs below are unique per screen;
repeated rows (chips, table rows, settle-up payments) use `data-*` attributes on
a shared container instead of one-off ids.

## Shared header/nav (all screens)

| ID                                                                                                           | Notes                                       |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| `navLinkSetup` / `navLinkExpenses` / `navLinkBalances` / `navLinkSettleUp` / `navLinkSummary`                | top nav, `data-target` points at the screen |
| `headerAddExpenseBtn`                                                                                        | top-right pill                              |
| `tripNameBadge`, `memberCountBadge`, `currencyBadge`, `expenseCountBadge`, `totalSpentBadge`, `perHeadBadge` | info bar                                    |

## Screen 01 — Setup

| ID                                          | Notes                                             |
| ------------------------------------------- | ------------------------------------------------- |
| `setupTripNameField`, `setupCurrencyField`  | display-only fields                               |
| `setupMemberCountLabel`                     | "N added"                                         |
| `setupPersonNameInput`, `setupAddPersonBtn` | add-person controls                               |
| `setupMembersList`                          | container; chips carry `data-person="priya"` etc. |
| `setupMemberWarning`                        | blocked-removal message                           |
| `setupContinueBtn`                          | → screen-02                                       |
| `setupGlanceBox`                            | empty-state preview box                           |

## Screen 02 — Add expense

| ID                                                                             | Notes                                            |
| ------------------------------------------------------------------------------ | ------------------------------------------------ |
| `addExpenseDescriptionField`, `addExpenseAmountField`, `addExpenseAmountError` |                                                  |
| `addExpensePayerField`, `addExpenseCategoryField`                              |                                                  |
| `addExpenseSplitEqualBtn`, `addExpenseSplitCustomBtn`                          | split-type toggle                                |
| `addExpenseSplitTable`                                                         | container; rows carry `data-person="priya"` etc. |
| `addExpenseShortfallRow`                                                       | red "doesn't add up" row                         |
| `addExpenseSaveBtn`, `addExpenseCancelBtn`, `addExpenseProblemsLabel`          |                                                  |
| `addExpenseEffectList`                                                         | right panel; rows carry `data-person="..."`      |

## Screen 03 — Expenses list

| ID                                                                                                     | Notes                                                                                          |
| ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `expensesSearchField`, `expensesPersonFilterField`, `expensesCategoryFilterField`, `expensesSortField` |                                                                                                |
| `expensesActiveFilterChip`, `expensesClearAllLink`                                                     |                                                                                                |
| `expensesList`                                                                                         | container; rows carry `data-expense="airbnb"`, `"dinner"`, `"tram"`, `"untitled"`, `"pasteis"` |
| `expensesExpandedDetail`                                                                               | the Airbnb row's expanded sub-table                                                            |
| `expensesSidebarTotal`                                                                                 |                                                                                                |
| `expensesSidebarBalanceList`                                                                           | rows carry `data-person="..."`                                                                 |
| `expensesSidebarSettleUpBtn`                                                                           | → screen-05                                                                                    |

## Screen 04 — Balances

| ID                                             | Notes                                                         |
| ---------------------------------------------- | ------------------------------------------------------------- |
| `balancesSumBadge`                             |                                                               |
| `balancesCardsGrid`                            | container; cards carry `data-person="priya"` etc.             |
| `balancesDetailHeading`, `balancesDetailTable` | "Alex — every expense" panel; rows carry `data-expense="..."` |
| `balancesBeforePanel`                          | pairwise-debt list; rows carry `data-pair="alex-priya"` etc.  |
| `balancesSeePlanBtn`                           | → screen-05                                                   |

## Screen 05 — Settle up

| ID                                          | Notes                                                                         |
| ------------------------------------------- | ----------------------------------------------------------------------------- |
| `settleUpList`                              | container; rows carry `data-payment="alex-priya"`, `"mia-priya"`, `"mia-sam"` |
| (class `settle-mark-paid-btn`)              | per-row "Mark paid" button — shared class, not an id, since it repeats        |
| `settleUpCopyBtn`, `settleUpRecalculateBtn` |                                                                               |
| `settleUpPlanQualityPanel`                  |                                                                               |

## Screen 06 — Summary

| ID                                                                                  | Notes                                                |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `summaryToggleWholeTripBtn`, `summaryTogglePerPersonBtn`                            |                                                      |
| `summaryTotalSpent`, `summaryAverageExpense`, `summaryTopSpender`, `summaryPerHead` |                                                      |
| `summaryCategoryBreakdown`                                                          | container; rows carry `data-category="lodging"` etc. |
| `summarySpendVsShareTable`                                                          | container; rows carry `data-person="..."`            |

## Screen 07 — Share

| ID                                                                          | Notes                                                                                                     |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `shareSummaryText`                                                          | `<pre>` with the copyable text                                                                            |
| `shareCopyBtn`, `shareCopiedBadge`, `sharePrintBtn`, `shareFallbackWarning` |                                                                                                           |
| `shareIncludeChecklist`                                                     | container; items carry `data-field="totals"`, `"paid"`, `"settleup"`, `"fullList"`, `"categoryBreakdown"` |

## Screen 08 — Empty states

| ID                                                  | Notes |
| --------------------------------------------------- | ----- |
| `emptyStateNoExpenses` / `emptyNoExpensesAddBtn`    |       |
| `emptyStateNoFilterMatch` / `emptyNoFilterClearBtn` |       |
| `emptyStateAllSettled` / `emptyAllSettledCopyBtn`   |       |
| `emptyStateNoPeople` / `emptyNoPeopleAddBtn`        |       |
