import type { Concept, Question, TopicId } from "./models";
import { diagnosticQuestions } from "./diagnostic-content";
import { lessonConcepts } from "./lesson-content";
import { practiceQuestions } from "./practice-content";

export const topics: ReadonlyArray<{
  id: TopicId;
  title: string;
  summary: string;
}> = [
  {
    id: "cloud-concepts",
    title: "Cloud concepts",
    summary:
      "Understand cloud models, responsibilities, and the value of cloud computing.",
  },
  {
    id: "azure-services",
    title: "Azure architecture and services",
    summary: "Explore the building blocks of Azure, from regions to identity.",
  },
  {
    id: "management-governance",
    title: "Azure management and governance",
    summary: "Understand costs, policies, and how to monitor your resources.",
  },
];

// Diagnostic IDs and ordering stay stable; the added bank supplies practice alternatives.
export const questions: readonly Question[] = [
  ...diagnosticQuestions,
  ...practiceQuestions,
];
export const concepts: readonly Concept[] = lessonConcepts;
