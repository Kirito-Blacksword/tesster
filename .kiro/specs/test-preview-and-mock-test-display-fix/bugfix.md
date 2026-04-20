# Bugfix Requirements Document

## Introduction

Two related bugs affect how admin-created custom tests are surfaced to users. First, the "Preview" button in the admin exam database navigates to `/exam/<uuid>` — this route resolves correctly via `getCustomExam`, but the exam shell receives the custom exam's UUID as `examId` while the `testId` search param is absent, which may cause downstream issues in the shell depending on how it resolves scoring/config. Second, and more critically, the "Open Test" button on the mock tests page navigates to `/exam/<baseExamId>?testId=<customExamUUID>` (e.g. `/exam/jee?testId=<uuid>`). The exam page resolves the route param `examId` as `"jee"` and loads the static boilerplate JEE config — completely ignoring the `testId` param that points to the actual custom exam. As a result, users taking a custom test see the generic boilerplate questions instead of the ones the admin created.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN an admin clicks the "Preview" button for a custom exam in the admin database THEN the system navigates to `/exam/<customExamUUID>` and the exam shell may not correctly resolve the custom exam's config, resulting in a broken or non-functional preview experience.

1.2 WHEN a user clicks "Open Test" on a custom mock test in the mock tests page THEN the system navigates to `/exam/<baseExamId>?testId=<customExamUUID>` (e.g. `/exam/jee?testId=<uuid>`), and the exam page loads the static boilerplate config for the base exam (e.g. JEE Main) instead of the custom exam's questions and settings.

1.3 WHEN the exam page receives a `testId` search param pointing to a custom exam UUID THEN the system ignores the `testId` param and serves the exam config identified solely by the `examId` route param.

### Expected Behavior (Correct)

2.1 WHEN an admin clicks the "Preview" button for a custom exam THEN the system SHALL navigate to a URL that correctly loads the custom exam's questions, duration, and scoring config from the database.

2.2 WHEN a user clicks "Open Test" on a custom mock test THEN the system SHALL load and display the custom exam's actual questions, duration, and scoring — not the boilerplate config of the base exam.

2.3 WHEN the exam page receives a `testId` search param that corresponds to a custom exam UUID THEN the system SHALL resolve the exam config using that `testId` (fetching from the database via `getCustomExam`) and use it as the active exam config, overriding the base exam config from the route param.

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user opens a standard (non-custom) mock test that has no `testId` param THEN the system SHALL CONTINUE TO load the correct static exam config based on the `examId` route param.

3.2 WHEN a user opens a standard mock test for JEE, BITSAT, COMEDK, or KCET THEN the system SHALL CONTINUE TO display the correct boilerplate questions, duration, and scoring for that exam.

3.3 WHEN the admin deletes a custom exam THEN the system SHALL CONTINUE TO remove it from the database and the admin exam list correctly.

3.4 WHEN a user views the mock tests page for a base exam THEN the system SHALL CONTINUE TO display custom mock tests in the correct category and section in the sidebar.

---

## Bug Condition Pseudocode

### Bug Condition Function

```pascal
FUNCTION isBugCondition(X)
  INPUT: X of type ExamPageRequest { examId: string, testId?: string }
  OUTPUT: boolean

  // Bug 1: testId is present and refers to a custom exam UUID, but examId is a base exam key
  IF X.testId IS NOT NULL AND X.examId IN ["jee", "bitsat", "comedk", "kcet"] THEN
    RETURN true
  END IF

  RETURN false
END FUNCTION
```

### Fix Checking Property

```pascal
// Property: Fix Checking — custom exam loads when testId is provided
FOR ALL X WHERE isBugCondition(X) DO
  result ← loadExamConfig'(X)
  ASSERT result.id = X.testId
  ASSERT result.questions = databaseQuestionsFor(X.testId)
END FOR
```

### Preservation Checking Property

```pascal
// Property: Preservation Checking — standard exams unaffected
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT loadExamConfig(X) = loadExamConfig'(X)
END FOR
```
