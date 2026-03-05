# MVP PRD Template

## 1. Executive Summary

Write one paragraph:
- What the app does.
- Whose problem it solves.
- Why this is an underserved Play Store opportunity now.

## 2. Market Opportunity

Include:
- Problem statement.
- Why existing Android apps fail to solve this well.
- TAM/SAM/SOM assumptions (state assumptions clearly).
- Competitor table.

| Competitor | Installs | Rating | Core Offer | User Complaints | Monetization |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

## 3. Target Users (3 Personas)

For each persona:
- Role/background.
- Current workflow.
- Top frustrations.
- Why they would switch/pay.

## 4. MVP Feature Set (5-8 Feature Groups)

For each feature group:
- User story.
- Functional requirements.
- Edge cases and failure handling.
- Success metric.

Recommended structure:
1. Onboarding and profile setup
2. Core workflow engine
3. Insights and recommendations
4. Notifications/reminders
5. Payment/subscription wall
6. Settings and privacy controls

## 5. Tech Stack Recommendation

Select one:
- Kotlin + Jetpack Compose
- Flutter
- React Native

Explain:
- Why this stack fits speed, performance, and maintainability needs.
- State management approach.
- Backend assumptions (Firebase/Supabase/custom API).
- Analytics and crash reporting stack.

## 6. Design Direction

Define:
- Visual direction: modern, minimalist, abstract.
- Color palette: primary, secondary, neutral, semantic colors.
- Typography: heading/body scales and weights.
- Component styling: buttons, cards, inputs, navigation bars.
- Play Store graphics direction: icon style, feature graphic tone, screenshot framing system.

## 7. Monetization and Launch Strategy

Include:
- Free vs premium split.
- Trial/paywall strategy.
- Pricing assumptions and conversion scenarios.
- Day-1 launch channels.
- First 30-day experiment plan.

## 8. Data Models

Define base interfaces for core entities.

Example:

```ts
interface UserProfile {
  id: string;
  segment: string;
  goal: string;
  createdAt: string;
}

interface ActivityLog {
  id: string;
  userId: string;
  eventType: string;
  value: number;
  occurredAt: string;
}

interface Recommendation {
  id: string;
  userId: string;
  title: string;
  rationale: string;
  confidence: number;
}
```

## 9. Non-Goals and Risks

List:
- What is intentionally out of scope for MVP.
- Major technical, legal, or trust risks.
- Mitigations and fallback plans.

## 10. Acceptance Criteria

Define launch-ready criteria:
- Functional MVP checklist.
- Quality and performance thresholds.
- Analytics events implemented.
- Billing flow validated.
