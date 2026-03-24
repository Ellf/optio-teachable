# optio-teachable

A lightweight, strictly-typed Node.js wrapper for the Teachable v1 API. Built on [Zod](https://zod.dev) for runtime schema validation, with full TypeScript support out of the box.

> Full documentation available at [useoptio.dev](https://useoptio.dev)

---

## Features

- ✅ Strongly typed responses via Zod schema validation
- ✅ Complete coverage of all Teachable v1 GET endpoints
- ✅ Clean versioned client (`v1`) designed for forward compatibility
- ✅ Helpful validation errors when the Teachable API returns unexpected data
- ✅ Intentionally read-only — safe to use in any environment
- ✅ Works with TypeScript and JavaScript

---

## Installation

```bash
npm install optio-teachable
```

Or via GitHub:

```bash
npm install git+ssh://git@github.com:Ellf/optio-teachable.git
```

---

## Quick Start

**TypeScript**
```typescript
import { TeachableClient } from 'optio-teachable';

const teachable = new TeachableClient(process.env.TEACHABLE_API_KEY);

const { users } = await teachable.v1.users.getList(1, 20);
console.log(`Fetched ${users.length} users.`);
```

**JavaScript**
```javascript
const { TeachableClient } = require('optio-teachable');

const teachable = new TeachableClient(process.env.TEACHABLE_API_KEY);

const { users } = await teachable.v1.users.getList(1, 20);
console.log(`Fetched ${users.length} users.`);
```

> It is strongly recommended to store your API key in an environment variable and never commit it to source control.

---

## API Reference

All methods return strongly-typed promises validated at runtime via Zod. If the Teachable API returns unexpected data or the request fails, the client throws a descriptive error indicating exactly which field failed validation.

### `teachable.v1.users`

| Method                           | Description                                                                                       |
|----------------------------------|---------------------------------------------------------------------------------------------------|
| `getList(page?, per?, filters?)` | Paginated list of users. Filter by `email` or use `searchAfter` to paginate beyond 10,000 records |
| `getById(id)`                    | Single user with course enrolment details, tags, and sign-in metadata                             |
| `getByEmail(email)`              | Search for a user by email address                                                                |

### `teachable.v1.courses`

| Method                                             | Description                                                                                   |
|----------------------------------------------------|-----------------------------------------------------------------------------------------------|
| `getList(page?, per?, filters?)`                   | Paginated list of courses. Filter by `name`, `isPublished`, `authorBioId`, or `createdAt`     |
| `getById(id)`                                      | Single course with full lecture section structure and author bio                              |
| `getEnrolments(courseId, page?, per?, filters?)`   | Paginated enrolments for a course. Filter by date range and sort direction                    |
| `getProgress(courseId, userId, page?, per?)`       | Progress record for a specific user on a course, including certificate and lecture completion |
| `getLecture(courseId, lectureId)`                  | Single lecture with all attachments including video, text, quiz, and embed content            |
| `getQuizIds(courseId, lectureId)`                  | Array of quiz IDs attached to a lecture                                                       |
| `getQuiz(courseId, lectureId, quizId)`             | Full quiz with all questions, answers, and grading configuration                              |
| `getQuizResponses(courseId, lectureId, quizId)`    | All student responses for a quiz including grades                                             |
| `getVideo(courseId, lectureId, videoId, filters?)` | Time-limited HLS stream URL and thumbnail for a lecture video                                 |

### `teachable.v1.transactions`

| Method                           | Description                                                                                                                                                  |
|----------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `getList(page?, per?, filters?)` | Paginated list of transactions. Filter by `userId`, `courseId`, `affiliateId`, `pricingPlanId`, `isFullyRefunded`, `isChargeback`, `startDate`, or `endDate` |
| `getById(id)`                    | Single transaction by ID                                                                                                                                     |

### `teachable.v1.pricingPlans`

| Method                 | Description                                                                          |
|------------------------|--------------------------------------------------------------------------------------|
| `getList(page?, per?)` | Paginated list of all pricing plans across the school                                |
| `getById(id)`          | Single pricing plan with full frequency configuration, free trial, and enrolment cap |

### `teachable.v1.webhooks`

| Method                                        | Description                                                                   |
|-----------------------------------------------|-------------------------------------------------------------------------------|
| `getList()`                                   | All webhooks registered on the school                                         |
| `getEvents(webhookId, page?, per?, filters?)` | Paginated delivery events for a webhook. Filter by HTTP status range and date |

### Advanced

| Method                                      | Description                                                                                  |
|---------------------------------------------|----------------------------------------------------------------------------------------------|
| `teachable.v1.getRaw(endpoint, logOutput?)` | Fetch any v1 endpoint without schema validation. Useful for exploring undocumented endpoints |

---

## TypeScript Types

All response types are exported from the SDK and can be used to type your own functions:

```typescript
import type {
    BasicUser,
    UserDetail,
    Course,
    CourseDetail,
    CourseProgress,
    Transaction,
    PricingPlan,
    PricingPlanDetail,
    Enrolment,
    LectureDetail,
    LectureAttachment,
    LectureVideo,
    LectureQuiz,
    QuizQuestion,
    QuizResponseStudent,
    Webhook,
    WebhookEvent,
} from 'optio-teachable';
```

---

## Debug Mode

Pass `true` as the second argument to enable request and response logging:

```typescript
const teachable = new TeachableClient(process.env.TEACHABLE_API_KEY, true);
```

This will log all outgoing requests and full response bodies to the console, prefixed with `[Teachable Debug]`.

---

## Read-Only by Design

This SDK covers every GET endpoint in the Teachable v1 API and intentionally implements no write operations. A read-only SDK is safe to use in scripts, reporting tools, and data pipelines without any risk of modifying your school's data. See the [full explanation](https://useoptio.dev/guides/read-only) in the docs.

---

## License

MIT — free to use, modify, and distribute.

Built by [Tom Lorimer](https://purplehippo.co.uk) · [Purple Hippo Web Studio](https://purplehippo.co.uk)