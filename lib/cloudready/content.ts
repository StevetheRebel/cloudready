import type { Concept, Question, TopicId } from "./models";
import { diagnosticQuestions } from "./diagnostic-content";

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

// Initial diagnostic bank; expand before claiming fresh targeted practice.
export const questions: readonly Question[] = diagnosticQuestions;
export const concepts: readonly Concept[] = [];
