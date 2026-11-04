/**
 * Sample Teachable v1 responses, one per endpoint.
 *
 * These are made-up data shaped like real responses. Never paste real school
 * data in here: this repo is public.
 */

export const meta = {
    total: 2,
    page: 1,
    from: 1,
    to: 2,
    per_page: 20,
    number_of_pages: 1,
};

export const userList = {
    users: [
        { id: 101, email: 'ada@example.com', name: 'Ada Lovelace' },
        { id: 102, email: 'alan@example.com', name: null },
    ],
    meta,
};

export const userDetail = {
    id: 101,
    email: 'ada@example.com',
    name: 'Ada Lovelace',
    src: 'Purchase',
    role: 'student',
    last_sign_in_at: '2026-10-01T09:30:00Z',
    last_sign_in_ip: null,
    sign_in_count: 12,
    tags: [{ name: 'vip' }],
    courses: [
        {
            course_id: 501,
            course_name: 'Intro to Engines',
            enrolled_at: '2026-01-15T10:00:00Z',
            percent_complete: 40,
            completed_at: null,
            is_active_enrollment: true,
        },
    ],
};

export const transactions = {
    transactions: [
        {
            id: 9001,
            user_id: 101,
            pricing_plan_id: 701,
            sale_id: 8001,
            created_at: '2026-01-15T10:00:00Z',
            purchased_at: '2026-01-15T10:00:00Z',
            refunded_at: null,
            charge: 4900,
            final_price: 4900,
            tax_charge: 0,
            revenue: 4500,
            amount_refunded: 0,
            chargeback_fee: null,
            affiliate_fees: null,
            author_fees: null,
            currency: 'USD',
            status: 'paid',
            has_chargeback: false,
            coupon_id: null,
            affiliate_id: null,
            author_id: null,
        },
    ],
    meta,
};

export const courseList = {
    courses: [
        {
            id: 501,
            name: 'Intro to Engines',
            heading: 'Learn the basics',
            description: null,
            is_published: true,
            image_url: 'https://example.com/engine.png',
            // Not in the schema. CourseSchema is loose, so this should be kept.
            extra_field: 'kept',
        },
    ],
    meta,
};

export const courseDetail = {
    course: {
        id: 501,
        name: 'Intro to Engines',
        heading: 'Learn the basics',
        description: '<p>Welcome</p>',
        is_published: true,
        image_url: null,
        lecture_sections: [
            {
                id: 601,
                name: 'Getting started',
                is_published: true,
                position: 1,
                lectures: [{ id: 3001, position: 1, is_published: true }],
            },
        ],
        author_bio: {
            user_id: 1,
            name: 'Charles Babbage',
            bio: null,
            profile_image_url: null,
        },
    },
};

export const enrolments = {
    enrollments: [
        {
            user_id: 101,
            enrolled_at: '2026-01-15T10:00:00Z',
            expires_at: null,
            completed_at: null,
            percent_complete: 40,
        },
    ],
    meta,
};

export const quizQuestion = {
    question: 'What powers the Analytical Engine?',
    question_type: 'single',
    answers: ['Steam', 'Wind'],
    correct_answers: ['Steam'],
    graded: true,
};

export const lectureDetail = {
    lecture: {
        id: 3001,
        name: 'Welcome',
        is_published: true,
        position: 1,
        lecture_section_id: 601,
        attachments: [
            { id: 1, name: null, kind: 'text', text: '<p>Hello</p>', position: 1 },
            { id: 2, name: 'Intro.mp4', kind: 'video', url: 'https://example.com/v.mp4', position: 2, file_size: 1024, file_extension: 'mp4' },
            { id: 3, name: 'Notes.pdf', kind: 'pdf_embed', url: 'https://example.com/n.pdf', position: 3 },
            { id: 4, name: 'Quiz', kind: 'quiz', position: 4, quiz: { id: 7001, questions: [quizQuestion] } },
        ],
    },
};

export const courseProgress = {
    course_progress: {
        id: 501,
        certificate: { page_id: null, issued_at: null, serial_number: null },
        completed_at: null,
        enrolled_at: '2026-01-15T10:00:00Z',
        percent_complete: 50,
        lecture_sections: [
            {
                id: 601,
                name: 'Getting started',
                lectures: [
                    { id: 3001, name: 'Welcome', is_completed: true, completed_at: '2026-01-16T10:00:00Z' },
                    { id: 3002, name: 'Next steps', is_completed: false, completed_at: null },
                ],
            },
        ],
    },
    meta,
};

export const quizIds = { quiz_ids: [7001, 7002] };

export const lectureQuiz = {
    quiz: {
        id: 4,
        name: 'Quiz',
        kind: 'quiz',
        url: null,
        text: null,
        position: 4,
        quiz: { id: 7001, type: 'Quiz', questions: [quizQuestion] },
    },
};

export const quizResponses = {
    quiz_responses: {
        course_id: 501,
        course_name: 'Intro to Engines',
        lecture_id: 3001,
        lecture_name: 'Welcome',
        graded: true,
        responses: [
            {
                student_id: 101,
                student_name: 'Ada Lovelace',
                student_email: 'ada@example.com',
                submitted_at: '2026-01-16T10:00:00Z',
                percent_correct: 100,
            },
        ],
    },
};

export const lectureVideo = {
    video: {
        id: 8801,
        status: 'READY',
        url_thumbnail: null,
        media_type: 'video',
        media_duration: 125,
        video_asset: { url: 'https://example.com/v.m3u8', content_type: 'application/x-mpegURL' },
    },
};

export const webhooks = {
    webhooks: [
        {
            id: 901,
            workflow_state: 'verified',
            url: 'https://example.com/hook',
            event_trigger: 'Sale.created',
            webhook_events_count: 3,
        },
    ],
};

export const webhookEvents = {
    events: [
        {
            id: 1,
            workflow_state: 'complete',
            webhook_id: 901,
            attempt_count: 1,
            last_attempted_at: '2026-01-15T10:00:05Z',
            created_at: '2026-01-15T10:00:00Z',
            object_type: 'Sale',
            object_id: 8001,
            response_http_status: 200,
        },
    ],
    meta,
};

export const pricingPlans = {
    pricing_plans: [
        {
            id: 701,
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z',
            name: 'One-off',
            price: 4900,
            currency: 'USD',
            course_id: 501,
        },
    ],
    meta,
};

export const pricingPlanDetail = {
    pricing_plan: {
        ...pricingPlans.pricing_plans[0],
        description: null,
        free_trial_length: null,
        enrollment_cap: null,
        frequency: {
            type: 'one_time',
            billing_interval: null,
            billing_interval_count: null,
            access_limit_date: null,
            access_limit_interval: null,
            access_limit_duration: null,
        },
    },
};
