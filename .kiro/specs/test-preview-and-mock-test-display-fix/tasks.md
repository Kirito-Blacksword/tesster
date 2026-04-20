# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Custom Exam Config Loads When testId Is Present
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior — it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to the concrete failing cases — `examId` is one of `["jee", "bitsat", "comedk", "kcet"]` and `testId` is a valid custom exam UUID
  - Mock `getCustomExam(testId)` to return a fake custom exam config with `id === testId` and distinct questions
  - Mock `getExamConfig(examId)` to return the static boilerplate config (e.g. JEE with placeholder questions)
  - Render `ExamPage` with `params = { examId: "jee" }` and `searchParams = { testId: "<custom-uuid>" }`
  - Assert that the `exam` prop passed to `ExamShell` has `id === testId` (not `"jee"`)
  - Assert that `exam.questions` matches the custom exam's questions, not the JEE boilerplate
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS — `exam.id` equals `"jee"` instead of the custom UUID (confirms bug exists)
  - Document counterexamples found (e.g. `exam.id = "jee"` when `testId = "clxabc123"`)
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.2, 1.3_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Standard Exam Config Unchanged When testId Is Absent
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: `ExamPage` with `examId="jee"` and no `testId` returns the static JEE config (75 placeholder questions, `scoring.correct = 4`)
  - Observe: `ExamPage` with `examId="bitsat"` and no `testId` returns the BITSAT config with `bonusUnlock` settings
  - Observe: `ExamPage` with `examId="comedk"` and no `testId` returns the COMEDK config with `scoring.incorrect = 0`
  - Observe: `ExamPage` with `examId="kcet"` and no `testId` returns the KCET config with `durationMinutes = 240`
  - Observe: `ExamPage` with `examId="<custom-uuid>"` and no `testId` falls through to `getCustomExam(examId)` and returns the custom config
  - Write property-based test: for all base exam keys in `["jee", "bitsat", "comedk", "kcet"]` with no `testId`, the resolved `exam.id` equals the input `examId` and `exam.questions` matches the static `examConfigs` entry
  - Write property-based test: for a UUID `examId` with no `testId`, `getCustomExam(examId)` is called and its result is used
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS — confirms baseline behavior to preserve
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2_

- [x] 3. Fix for test preview and mock test display

  - [x] 3.1 Add `testId`-first resolution branch in `app/exam/[examId]/page.tsx`
    - Before the existing `getExamConfig(examId)` call, check if `testId` is present
    - If `testId` is present, call `await getCustomExam(testId)` and use the result as the active config
    - If `getCustomExam(testId)` returns `null`, call `notFound()`
    - Preserve the existing `getExamConfig(examId)` → `getCustomExam(examId)` fallback chain for requests where `testId` is absent
    - _Bug_Condition: isBugCondition(X) where X.testId IS NOT NULL AND X.examId IN ["jee", "bitsat", "comedk", "kcet"]_
    - _Expected_Behavior: exam.id === testId AND exam.questions === databaseQuestionsFor(testId)_
    - _Preservation: All requests where testId is absent MUST produce the same resolved ExamConfig as before_
    - _Requirements: 2.2, 2.3, 3.1, 3.2_

  - [x] 3.2 Fix the admin Preview link in `app/admin/page.tsx`
    - Change the Preview `<Link>` href from `/exam/${exam.id}` to `/exam/${exam.baseExamId}?testId=${exam.id}` when `exam.baseExamId` is set
    - When `exam.baseExamId` is absent (standalone custom exam with no base), keep the existing `/exam/${exam.id}` href
    - This ensures `resolvedTestId` inside `ExamShell` is set to the correct UUID instead of `"<uuid>-open"`
    - _Bug_Condition: admin preview link for a custom exam that has baseExamId set_
    - _Expected_Behavior: URL is /exam/<baseExamId>?testId=<uuid>, resolvedTestId === exam.id_
    - _Requirements: 2.1_

  - [x] 3.3 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Custom Exam Config Loads When testId Is Present
    - **IMPORTANT**: Re-run the SAME test from task 1 — do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.2, 2.3_

  - [x] 3.4 Verify preservation tests still pass
    - **Property 2: Preservation** - Standard Exam Config Unchanged When testId Is Absent
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
