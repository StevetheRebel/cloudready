import {
  dateKeySchema,
  recallRatingSchema,
  revisionSchema,
  timezoneSchema,
  type RecallRating,
  type RevisionItem,
} from "./models";

// Calendar dates avoid DST drift and follow the learner's chosen timezone.
export function dateInTimezone(now: Date, timezone: string) {
  timezoneSchema.parse(timezone);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) =>
    parts.find((entry) => entry.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
export function addCalendarDays(date: string, days: number) {
  dateKeySchema.parse(date);
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}
// Again: 1 day; Hard: 3; Good: 7; Easy: 16, doubling on consecutive Easy ratings, capped at 120.
export function scheduleNext(
  item: RevisionItem,
  rating: RecallRating,
  timezone: string,
  now = new Date(),
): RevisionItem {
  revisionSchema.parse(item);
  recallRatingSchema.parse(rating);
  const easyStreak = rating === "easy" ? Math.min(item.easyStreak + 1, 5) : 0;
  const intervalDays =
    rating === "easy"
      ? Math.min(16 * 2 ** (easyStreak - 1), 120)
      : { again: 1, hard: 3, good: 7 }[rating];
  return revisionSchema.parse({
    ...item,
    intervalDays,
    easyStreak,
    reviews: item.reviews + 1,
    lastRating: rating,
    lastReviewedAt: now.toISOString(),
    nextReviewDate: addCalendarDays(
      dateInTimezone(now, timezone),
      intervalDays,
    ),
  });
}
export function isDue(item: RevisionItem, timezone: string, now = new Date()) {
  return item.nextReviewDate <= dateInTimezone(now, timezone);
}
