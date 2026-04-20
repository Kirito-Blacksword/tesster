# Test Preview and Mock Test Display Fix — Bugfix Design

## Overview

Two related bugs prevent custom exam configs from loading correctly in the exam shell.

**Bug 1 (Preview):** The admin "Preview" button links to `/exam/<customExamUUID>`. The exam page's current logic calls `getExamConfig(examId)` first, which looks up the static `examConfigs` map. A UUID won't match any static key, so it falls through to `getCustomExam(examId)` — this path actually works. However, the `testId` search param is absent, so `ExamShell` computes `resolvedTestId` as `"<uuid>-open"` instead of the actual UUID, which may cause incorrect attempt tracking and premium-access checks.

**Bug 2 (Open Test):** The mock tests board links to `/exam/<baseExamId>?testId=<customExamUUID>` (e.g. `/exam/jee?testId=<uuid>`). The exam page resolves `examId = "jee"`, finds the static JEE config immediately, and returns it — the `testId` param is passed to `ExamShell` but the wrong `exam` object (the boilerplate JEE config) is already loaded. Users see generic boilerplate questions instead of the admin-created ones.

The fix is a single targeted change in `app/exam/[examId]/page.tsx`: when a `testId` search param is present, fetch the custom exam config using `getCustomExam(testId)` and use it as the active config, ignoring the base exam route param for config resolution.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug — an `ExamPageRequest` where `testId` is present and `examId` is a base exam key (e.g. `"jee"`), causing the wrong config to load.
- **Property (P)**: The desired behavior when the bug condition holds — the exam page SHALL load the custom exam config identified by `testId`, not the boilerplate config for `examId`.
- **Preservation**: All existing behavior for requests where `testId` is absent must remain completely unchanged.
- **`getExamConfig(examId)`**: Function in `lib/exams.ts` that looks up the static `examConfigs` map by key. Returns `undefined` for UUIDs not registered as static exams.
- **`getCustomExam(id)`**: Async function in `lib/custom-exams.ts` that fetches a custom exam record from the database by UUID. Returns `null` if not found.
- **`ExamPage`**: The Next.js server component at `app/exam/[examId]/page.tsx` responsible for resolving the exam config and rendering `ExamShell`.
- **`ExamShell`**: The client component in `components/exam-shell.tsx` that receives a resolved `ExamConfig` and an optional `testId` prop for attempt tracking.
- **`baseExamId`**: The static exam key (e.g. `"jee"`, `"bitsat"`) stored on a custom exam record, used for categorisation on the mock tests page.
- **`resolvedTestId`**: The value computed inside `ExamShell` as `testId?.trim() || \`${exam.id}-open\`` — used for premium-access checks and attempt recording.

## Bug Details

### Bug Condition

The bug manifests when the exam page receives a `testId` search param pointing to a custom exam UUID while `examId` is a base exam key. The `ExamPage` component resolves the config using `examId` first, finds the static boilerplate config, and returns it without ever consulting `testId`.

**Formal Specification:**
```
FUNCTION isBugCondition(X)
  INPUT: X of type ExamPageRequest { examId: string, testId?: string }
  OUTPUT: boolean

  IF X.testId IS NOT NULL
     AND X.examId IN ["jee", "bitsat", "comedk", "kcet"]
  THEN
    RETURN true
  END IF

  RETURN false
END FUNCTION
```

### Examples

- **Bug 2 (primary):** User clicks "Open Test" for a custom JEE mock. URL becomes `/exam/jee?testId=clxabc123`. `examId = "jee"` resolves to the static JEE boilerplate (75 placeholder questions). `testId` is passed to `ExamShell` but the wrong config is already loaded. User sees generic questions instead of admin-created ones.
- **Bug 2 (edge — out of range key):** URL is `/exam/bitsat?testId=clxdef456`. Same failure: BITSAT boilerplate loads, custom config is ignored.
- **Bug 1 (secondary):** Admin clicks "Preview" for a custom exam. URL is `/exam/clxabc123` (no `testId`). `getExamConfig("clxabc123")` returns `undefined`, then `getCustomExam("clxabc123")` succeeds. Config loads correctly, but `resolvedTestId` inside `ExamShell` becomes `"clxabc123-open"` instead of `"clxabc123"`, causing attempt records and premium checks to use a wrong ID.
- **Non-bug (standard exam):** URL is `/exam/jee` with no `testId`. `isBugCondition` returns false. Static JEE config loads as expected — no change required.

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Opening a standard exam via `/exam/jee` (no `testId`) MUST continue to load the static JEE boilerplate config.
- Opening a standard exam for BITSAT, COMEDK, or KCET MUST continue to load the correct static config.
- The admin delete flow (`DeleteTestButton`) MUST continue to work correctly.
- The mock tests page sidebar, filtering, and test listing MUST remain unchanged.
- `ExamShell` internal logic (timer, scoring, attempt recording, premium gate) MUST remain unchanged.

**Scope:**
All requests where `testId` is absent are completely unaffected by this fix. This includes:
- Direct navigation to `/exam/jee`, `/exam/bitsat`, `/exam/comedk`, `/exam/kcet`
- Admin preview links that already use the UUID as `examId` with no `testId` (Bug 1 partial path — config loads, only `resolvedTestId` is affected)
- Any other page that does not pass a `testId` search param

## Hypothesized Root Cause

Based on code inspection of `app/exam/[examId]/page.tsx`:

1. **`testId` param is read but never used for config resolution**: The page destructures `testId` from `searchParams` and passes it to `ExamShell`, but the config resolution logic only ever uses `examId`. There is no branch that checks `testId` first.

2. **Static config lookup short-circuits the fallback**: `getExamConfig(examId)` returns the full JEE/BITSAT/etc. config immediately when `examId` is a base exam key. The `getCustomExam` fallback is only reached when `getExamConfig` returns `undefined` — which never happens for valid base exam keys.

3. **Bug 1 — `resolvedTestId` mismatch**: In `ExamShell`, `resolvedTestId = testId?.trim() || \`${exam.id}-open\``. When the admin preview URL is `/exam/<uuid>` with no `testId`, `resolvedTestId` becomes `"<uuid>-open"` rather than `"<uuid>"`. This affects `canAccessMockTest` and `recordAttemptFromResult` calls.

4. **Admin preview link does not pass `testId`**: `app/admin/page.tsx` renders `<Link href={\`/exam/${exam.id}\`}>Preview</Link>`. For a custom exam whose `baseExamId` is `"jee"`, the correct URL should be `/exam/jee?testId=${exam.id}` to be consistent with the mock tests board pattern and to ensure `resolvedTestId` is set correctly.

## Correctness Properties

Property 1: Bug Condition — Custom Exam Config Loads When testId Is Present

_For any_ `ExamPageRequest` where `isBugCondition` returns true (i.e. `testId` is present and `examId` is a base exam key), the fixed `ExamPage` SHALL resolve the exam config by calling `getCustomExam(testId)` and the loaded `exam.id` SHALL equal `testId`, with `exam.questions` matching the database records for that custom exam.

**Validates: Requirements 2.2, 2.3**

Property 2: Preservation — Standard Exam Config Unchanged When testId Is Absent

_For any_ `ExamPageRequest` where `isBugCondition` returns false (i.e. `testId` is absent), the fixed `ExamPage` SHALL produce exactly the same resolved `ExamConfig` as the original code, preserving all static boilerplate configs for JEE, BITSAT, COMEDK, and KCET.

**Validates: Requirements 3.1, 3.2**

## Fix Implementation

### Changes Required

**File:** `app/exam/[examId]/page.tsx`

**Function:** `ExamPage` (default export)

**Specific Changes:**

1. **Add `testId`-first resolution branch**: Before looking up `examId`, check if `testId` is present. If so, call `getCustomExam(testId)` and use the result as the active config. If `getCustomExam(testId)` returns `null`, call `notFound()`.

2. **Preserve existing fallback logic**: The existing `getExamConfig(examId)` → `getCustomExam(examId)` chain must remain intact for requests without `testId`.

**Pseudocode for fixed resolution logic:**
```
IF testId IS NOT NULL THEN
  exam ← await getCustomExam(testId)
  IF exam IS NULL THEN notFound()
ELSE
  exam ← getExamConfig(examId)
  IF exam IS NULL THEN
    exam ← await getCustomExam(examId)
  END IF
  IF exam IS NULL THEN notFound()
END IF

RETURN <ExamShell exam={exam} testId={testId} />
```

---

**File:** `app/admin/page.tsx`

**Specific Changes:**

3. **Fix Preview link URL**: Change the admin preview link from `/exam/${exam.id}` to `/exam/${exam.baseExamId ?? exam.id}?testId=${exam.id}` when `baseExamId` is present. This ensures the URL pattern is consistent with the mock tests board and that `resolvedTestId` in `ExamShell` is set to the correct UUID.

   - If `exam.baseExamId` is set (e.g. `"jee"`): link to `/exam/jee?testId=<uuid>`
   - If `exam.baseExamId` is absent (standalone custom exam): link to `/exam/<uuid>` (existing behavior, already works)

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that render `ExamPage` with a `testId` search param and a base `examId`, then assert that the resolved exam config matches the custom exam from the database — not the static boilerplate. Run these tests on the UNFIXED code to observe failures.

**Test Cases**:
1. **Custom JEE mock loads correctly**: Render `ExamPage` with `examId="jee"` and `testId=<custom-uuid>`. Assert `exam.id === <custom-uuid>` and `exam.questions` match DB records. (will fail on unfixed code — returns JEE boilerplate)
2. **Custom BITSAT mock loads correctly**: Same pattern with `examId="bitsat"`. (will fail on unfixed code)
3. **`notFound` on invalid testId**: Render with `testId="nonexistent-uuid"`. Assert `notFound()` is called. (may fail on unfixed code — falls through to base exam config)
4. **Admin preview resolvedTestId**: Render `ExamPage` with `examId=<uuid>` and no `testId`. Assert `resolvedTestId` inside `ExamShell` equals `<uuid>`, not `"<uuid>-open"`. (will fail on unfixed code)

**Expected Counterexamples**:
- `exam.id` equals `"jee"` instead of the custom UUID when `testId` is present
- `exam.questions` contains placeholder boilerplate instead of admin-created questions
- Possible causes: `testId` param never consulted for config resolution; static config lookup short-circuits the fallback

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL X WHERE isBugCondition(X) DO
  result ← ExamPage_fixed(X)
  ASSERT result.exam.id = X.testId
  ASSERT result.exam.questions = databaseQuestionsFor(X.testId)
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT ExamPage_original(X).exam = ExamPage_fixed(X).exam
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe that standard exam routes load correctly on unfixed code, then write property-based tests that verify the same configs are returned after the fix.

**Test Cases**:
1. **JEE standard route preservation**: `/exam/jee` with no `testId` returns the static JEE config with 75 questions and correct scoring.
2. **BITSAT standard route preservation**: `/exam/bitsat` with no `testId` returns the static BITSAT config including bonus unlock settings.
3. **COMEDK/KCET standard route preservation**: Same pattern for remaining base exams.
4. **UUID-only route preservation (Bug 1 path)**: `/exam/<uuid>` with no `testId` still resolves via `getCustomExam(examId)` fallback.

### Unit Tests

- Test `ExamPage` with `testId` present and a valid custom exam UUID — assert custom config is returned
- Test `ExamPage` with `testId` present and an invalid UUID — assert `notFound()` is called
- Test `ExamPage` with no `testId` and a valid base exam key — assert static config is returned unchanged
- Test `ExamPage` with no `testId` and a UUID as `examId` — assert `getCustomExam` fallback is used
- Test admin preview link renders with correct `?testId=` param when `baseExamId` is set

### Property-Based Tests

- Generate random base exam keys (`"jee"`, `"bitsat"`, `"comedk"`, `"kcet"`) with no `testId` and verify the returned config matches the static `examConfigs` entry
- Generate random custom exam UUIDs as `testId` with a base `examId` and verify `exam.id === testId` after the fix
- Generate random non-base-exam strings as `examId` with no `testId` and verify the fallback to `getCustomExam` is attempted

### Integration Tests

- Full flow: admin creates a custom exam → mock tests page shows it → user clicks "Open Test" → exam shell loads custom questions
- Full flow: admin clicks "Preview" → exam shell loads custom questions with correct `resolvedTestId`
- Regression: user opens `/exam/jee` directly → JEE boilerplate loads, no regressions in timer, scoring, or submission
