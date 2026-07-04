# MCQ App Backend — API Contract

Base URL: `/api/v1` (health at `/health`).

Authentication: `Authorization: Bearer <firebase_id_token>` unless noted.

All timestamps are ISO 8601 UTC strings in JSON responses.

## Error Format

All error responses use:

```json
{
  "error": {
    "code": "VALIDATION_ERROR|UNAUTHORIZED|FORBIDDEN|NOT_FOUND|RATE_LIMITED|CONFLICT|LLM_ERROR|NO_QUESTION_SERVED|INTERNAL",
    "message": "Human-readable message",
    "details": {}
  }
}
```

| HTTP Status | Code | When |
|-------------|------|------|
| 400 | VALIDATION_ERROR | Invalid request body or query params |
| 401 | UNAUTHORIZED | Missing/invalid/expired token |
| 403 | FORBIDDEN | Valid token but insufficient role or inactive user |
| 404 | NOT_FOUND | Resource not found |
| 404 | NO_QUESTION_SERVED | Test has no served questions yet |
| 409 | CONFLICT | Duplicate answer, already at first question, etc. |
| 429 | RATE_LIMITED | Rate limit exceeded |
| 503 | LLM_ERROR | All LLM providers failed |
| 500 | INTERNAL | Unexpected server error |

---

## Health

### GET /health

No authentication required.

**Response 200:**
```json
{
  "status": "ok",
  "version": "0.1.0"
}
```

---

## Auth / Me

### GET /api/v1/me

Auth: any authenticated user.

Upserts `users/{uid}` on first call. Rejects inactive users with 403.

**Response 200:**
```json
{
  "uid": "abc123",
  "email": "learner@example.com",
  "displayName": "Jane",
  "role": "learner",
  "status": "active"
}
```

### POST /api/v1/auth/login-failed

Auth: none (public).

Called by frontend after Firebase sign-in failure.

**Request body:**
```json
{
  "email": "user@example.com"
}
```

**Response 200:**
```json
{
  "recorded": true,
  "alertSent": false
}
```

---

## Profile

### GET /api/v1/profile

Auth: authenticated.

**Response 200:**
```json
{
  "uid": "abc123",
  "email": "learner@example.com",
  "displayName": "Jane",
  "role": "learner",
  "status": "active",
  "createdAt": "2026-07-04T00:00:00Z",
  "lastLoginAt": "2026-07-04T12:00:00Z"
}
```

### PATCH /api/v1/profile

Auth: authenticated.

**Request body:**
```json
{
  "displayName": "Jane Doe"
}
```

**Response 200:** Same shape as GET /profile.

---

## Learner — Tests

### POST /api/v1/tests

Auth: learner or admin.

**Request body:**
```json
{
  "topic": "Python Generators",
  "difficulty": "moderate"
}
```

`difficulty` enum: `basic`, `moderate`, `advanced`, `challenge`.

**Response 201:**
```json
{
  "id": "testId",
  "topic": "Python Generators",
  "topicSlug": "python-generators",
  "difficulty": "moderate",
  "status": "in_progress",
  "questionCap": 50,
  "servedCount": 0,
  "currentSequenceIndex": -1,
  "createdAt": "2026-07-04T00:00:00Z"
}
```

### GET /api/v1/tests

Auth: learner or admin (returns own tests).

Query params: `limit` (default 20, max 50), `cursor`, `status` (optional).

**Response 200:**
```json
{
  "items": [
    {
      "id": "testId",
      "topic": "Python Generators",
      "topicSlug": "python-generators",
      "difficulty": "moderate",
      "status": "in_progress",
      "questionCap": 50,
      "servedCount": 5,
      "currentSequenceIndex": 4,
      "createdAt": "2026-07-04T00:00:00Z",
      "completedAt": null
    }
  ],
  "nextCursor": "eyJ..."
}
```

### GET /api/v1/tests/{testId}

Auth: owner.

**Response 200:** Test summary (same fields as list item).

### GET /api/v1/tests/{testId}/current-question

Auth: owner.

**Response 200 (in progress):**
```json
{
  "testId": "testId",
  "sequenceIndex": 0,
  "totalServed": 1,
  "questionCap": 50,
  "isComplete": false,
  "question": {
    "id": "q1",
    "text": "What is a generator in Python?",
    "options": [
      {"id": "a", "text": "A function that yields values lazily"},
      {"id": "b", "text": "A built-in random number API"}
    ],
    "questionType": "single",
    "tier": "moderate"
  },
  "answer": null
}
```

If answered, `answer` includes:
```json
{
  "selectedOptionIds": ["a"],
  "isCorrect": true,
  "answeredAt": "2026-07-04T01:00:00Z"
}
```

**Response 200 (complete):**
```json
{
  "testId": "testId",
  "sequenceIndex": 49,
  "totalServed": 50,
  "questionCap": 50,
  "isComplete": true,
  "question": null,
  "answer": null
}
```

**Response 404:** `NO_QUESTION_SERVED` when `currentSequenceIndex == -1`.

### POST /api/v1/tests/{testId}/next

Auth: owner. Rate limit: 10/min (LLM bucket).

Lazy serve behavior:
1. If navigating forward within served questions → increment index, return existing.
2. If `servedCount >= questionCap` → mark completed, return `isComplete: true`.
3. Else → select tier, pull from pool or generate batch, copy to test, return new question.

**Response 200:** Same shape as current-question response.

### POST /api/v1/tests/{testId}/previous

Auth: owner.

Decrements `currentSequenceIndex` if > 0. Never generates new questions.

**Response 200:** Same shape as current-question response.

**Response 409:** Already at first question.

### POST /api/v1/tests/{testId}/questions/{questionId}/answers

Auth: owner.

**Request body:**
```json
{
  "selectedOptionIds": ["a"]
}
```

**Response 200:**
```json
{
  "isCorrect": true,
  "correctOptionIds": ["a"],
  "explanation": "Generators yield values lazily...",
  "hint": "Option b refers to the random module...",
  "answeredAt": "2026-07-04T01:00:00Z"
}
```

**Response 409:** Question already answered.

### GET /api/v1/tests/{testId}/questions

Auth: owner.

**Response 200:**
```json
{
  "items": [
    {
      "id": "q1",
      "sequenceIndex": 0,
      "text": "What is a generator?",
      "answered": true,
      "isCorrect": true
    },
    {
      "id": "q2",
      "sequenceIndex": 1,
      "text": "Which keyword defines a generator?",
      "answered": false,
      "isCorrect": null
    }
  ]
}
```

### GET /api/v1/tests/{testId}/questions/{questionId}/review

Auth: owner.

**Response 200:**
```json
{
  "id": "q1",
  "sequenceIndex": 0,
  "text": "What is a generator in Python?",
  "options": [{"id": "a", "text": "..."}, {"id": "b", "text": "..."}],
  "questionType": "single",
  "tier": "moderate",
  "correctOptionIds": ["a"],
  "explanation": "...",
  "hint": "...",
  "userAnswer": {
    "selectedOptionIds": ["b"],
    "isCorrect": false,
    "answeredAt": "2026-07-04T01:00:00Z"
  }
}
```

---

## Admin — Users

### GET /api/v1/admin/users

Auth: admin.

Query: `status`, `role`, `limit`, `cursor`.

**Response 200:**
```json
{
  "items": [
    {
      "uid": "abc123",
      "email": "learner@example.com",
      "displayName": "Jane",
      "role": "learner",
      "status": "active",
      "createdAt": "2026-07-01T00:00:00Z",
      "lastLoginAt": "2026-07-04T00:00:00Z"
    }
  ],
  "nextCursor": null
}
```

### POST /api/v1/admin/users

Auth: admin.

**Request body:**
```json
{
  "email": "newuser@example.com",
  "displayName": "New User",
  "role": "learner"
}
```

**Response 201:**
```json
{
  "uid": "newUid",
  "email": "newuser@example.com",
  "displayName": "New User",
  "role": "learner",
  "status": "pending_invite"
}
```

### PATCH /api/v1/admin/users/{uid}/status

Auth: admin.

**Request body:**
```json
{
  "status": "active"
}
```

Values: `active`, `inactive`.

**Response 200:** Updated user object.

### GET /api/v1/admin/users/{uid}/activity

Auth: admin.

Query: `from`, `to`, `limit`.

**Response 200:**
```json
{
  "uid": "abc123",
  "sessions": [
    {
      "sessionId": "uuid",
      "testId": "testId",
      "topic": "Python Generators",
      "sessionStart": "2026-07-04T10:00:00Z",
      "sessionEnd": "2026-07-04T10:45:00Z",
      "questionsAnswered": 12,
      "durationSeconds": 2700
    }
  ],
  "totalQuestionsAnswered": 48,
  "totalSessions": 4
}
```

---

## Admin — Settings & Alerts

### GET /api/v1/admin/settings

Auth: admin.

**Response 200:**
```json
{
  "maxQuestionsPerTopicDefault": 50,
  "maxQuestionsPerTopicOverrides": {"python-generators": 100},
  "poolLowWaterMark": 10,
  "generationBatchSize": 18,
  "maxLoginAttempts": 5,
  "sessionTimeoutMinutes": 60,
  "maxConcurrentSessionsPerLearner": 3,
  "minPasswordComplexity": {
    "minLength": 8,
    "requireUpper": true,
    "requireLower": true,
    "requireDigit": true,
    "requireSpecial": false
  },
  "dataRetentionDays": 365,
  "dailyLlmTokenBudget": 100000,
  "monthlyLlmTokenBudget": 2000000,
  "updatedAt": "2026-07-04T00:00:00Z",
  "updatedBy": "adminUid"
}
```

### PUT /api/v1/admin/settings

Auth: admin. Full settings replace (partial merge also supported).

**Response 200:** Updated settings.

### GET /api/v1/admin/alerts

Auth: admin.

**Response 200:**
```json
{
  "alertEmail": "admin@example.com",
  "alertThresholdPercent": 80,
  "maxLoginAttempts": 5
}
```

### PUT /api/v1/admin/alerts

Auth: admin.

**Request body:**
```json
{
  "alertEmail": "admin@example.com",
  "alertThresholdPercent": 80,
  "maxLoginAttempts": 5
}
```

**Response 200:** Updated alert config.

---

## Admin — AI Providers

### GET /api/v1/admin/ai-providers

Auth: admin.

**Response 200:**
```json
{
  "items": [
    {
      "id": "providerId",
      "name": "Claude Primary",
      "vendor": "anthropic",
      "modelId": "claude-sonnet-4-20250514",
      "secretManagerRef": "projects/topicmastery-core-2026/secrets/anthropic-api-key/versions/latest",
      "difficultyLevels": ["basic", "moderate"],
      "maxTokensPerCall": 4096,
      "monthlySpendCapUsd": 200.0,
      "status": "active",
      "fallbackPriority": 1,
      "usage": {
        "callsThisMonth": 42,
        "estimatedTokensThisMonth": 85000,
        "estimatedCostUsdThisMonth": 12.5,
        "periodStart": "2026-07-01T00:00:00Z"
      },
      "createdAt": "2026-07-01T00:00:00Z",
      "updatedAt": "2026-07-04T00:00:00Z"
    }
  ]
}
```

Note: API keys are never returned in responses.

### POST /api/v1/admin/ai-providers

Auth: admin.

**Request body:**
```json
{
  "name": "Claude Primary",
  "vendor": "anthropic",
  "modelId": "claude-sonnet-4-20250514",
  "secretManagerRef": "projects/topicmastery-core-2026/secrets/anthropic-api-key/versions/latest",
  "difficultyLevels": ["basic", "moderate"],
  "maxTokensPerCall": 4096,
  "monthlySpendCapUsd": 200.0,
  "fallbackPriority": 1,
  "status": "active"
}
```

**Response 201:** Created provider (no secret value).

### PUT /api/v1/admin/ai-providers/{providerId}

Auth: admin.

**Response 200:** Updated provider.

### POST /api/v1/admin/ai-providers/{providerId}/rotate-key

Auth: admin.

**Request body:**
```json
{
  "secretManagerRef": "projects/topicmastery-core-2026/secrets/anthropic-api-key-v2/versions/latest"
}
```

Raw API keys are never accepted in request bodies.

**Response 200:** Updated provider metadata.

---

## Admin — Tests

### PATCH /api/v1/admin/tests/{testId}

Auth: admin.

**Request body:**
```json
{
  "topic": "Advanced Python",
  "difficulty": "advanced"
}
```

Metadata only; does not alter served questions.

**Response 200:** Updated test summary.

---

## Admin — Activities

### GET /api/v1/admin/activities/summary

Auth: admin.

Query: `from`, `to` (ISO dates, default last 30 days).

**Response 200:**
```json
{
  "period": {
    "from": "2026-06-04T00:00:00Z",
    "to": "2026-07-04T00:00:00Z"
  },
  "totalSessions": 120,
  "totalQuestionsAnswered": 840,
  "avgSessionDurationSeconds": 620,
  "topicsCreated": [
    {"topicSlug": "python-generators", "count": 45}
  ],
  "activeUsers": 32
}
```

### GET /api/v1/admin/activities/sessions

Auth: admin.

Query: `uid`, `from`, `to`, `limit`, `cursor`.

**Response 200:**
```json
{
  "items": [
    {
      "id": "logId",
      "uid": "abc123",
      "sessionId": "uuid",
      "testId": "testId",
      "topic": "Python Generators",
      "topicSlug": "python-generators",
      "sessionStart": "2026-07-04T10:00:00Z",
      "sessionEnd": "2026-07-04T10:45:00Z",
      "questionsAnswered": 12,
      "durationSeconds": 2700
    }
  ],
  "nextCursor": null
}
```
