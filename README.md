# teachable-api-wrapper

A lightweight, strictly-typed Node.js wrapper for the Teachable v1 API. Built on [Zod](https://zod.dev) for runtime schema validation, with full TypeScript support out of the box.

> Full documentation available at [useoptio.dev](https://useoptio.dev)

---

## Features

- ✅ Strongly typed responses via Zod schema validation
- ✅ Covers Users, Courses, Transactions, Enrolments, and Lectures
- ✅ Clean versioned client (`v1`) designed for forward compatibility
- ✅ Helpful validation errors when the Teachable API returns unexpected data
- ✅ Works with TypeScript and JavaScript

---

## Installation

```bash
npm install teachable-api-wrapper
```

Or via GitHub:

```bash
npm install git+ssh://git@github.com:YOUR_GITHUB_USERNAME/teachable-api-wrapper.git
```

---

## Quick Start

**TypeScript**
```typescript
import { TeachableClient } from 'teachable-api-wrapper';

const teachable = new TeachableClient(process.env.TEACHABLE_API_KEY);

const { users } = await teachable.v1.users.getList(1, 20);
console.log(`Fetched ${users.length} users.`);
```

**JavaScript**
```javascript
const { TeachableClient } = require('teachable-api-wrapper');

const teachable = new TeachableClient(process.env.TEACHABLE_API_KEY);

const { users } = await teachable.v1.users.getList(1, 20);
console.log(`Fetched ${users.length} users.`);
```

> It is strongly recommended to store your API key in an environment variable and never commit it to source control.

---

## API Reference

All methods return strongly-typed promises validated at runtime via Zod. If the Teachable API returns unexpected data or the request fails, the client throws a descriptive error indicating exactly which field failed validation.

### `teachable.v1.users`

| Method | Description |
|---|---|
| `getList(page?, per?)` | Paginated list of users |
| `getById(id)` | Single user with course enrolment details |
| `getByEmail(email)` | Search for a user by email address |

### `teachable.v1.courses`

| Method | Description |
|---|---|
| `getList(page?, per?, filters?)` | Paginated list of courses. Filter by `name`, `isPublished`, or `authorBioId` |
| `getById(id)` | Single course with lecture sections and author bio |
| `getEnrolments(courseId, page?, per?)` | Paginated enrolments for a course |
| `getLecture(courseId, lectureId)` | Single lecture with attachments and quiz content |

### `teachable.v1.transactions`

| Method | Description |
|---|---|
| `getList(page?, per?, filters?)` | Paginated list of transactions. Filter by `userId`, `courseId`, `affiliateId`, `pricingPlanId`, `isFullyRefunded`, `isChargeback`, `startDate`, or `endDate` |
| `getById(id)` | Single transaction by ID |

### Advanced

| Method | Description |
|---|---|
| `teachable.v1.getRaw(endpoint, logOutput?)` | Fetch any v1 endpoint without schema validation. Useful for exploring undocumented endpoints |

---

## TypeScript Types

All Zod schemas are exported as inferred TypeScript types for use in your own application:

```typescript
import type {
    BasicUser,
    UserDetail,
    Course,
    CourseDetail,
    Transaction,
    Enrolment,
    LectureDetail,
} from 'teachable-api-wrapper';
```

---

## Debug Mode

Pass `true` as the second argument to enable request and response logging:

```typescript
const teachable = new TeachableClient(process.env.TEACHABLE_API_KEY, true);
```

This will log all outgoing requests and full response bodies to the console, prefixed with `[Teachable Debug]`.

---

## License

MIT — free to use, modify, and distribute.

> Looking for advanced features including enrollments management, webhooks, and multi-school support? [Optio](https://useoptio.dev) is our enterprise-grade Teachable integration platform.