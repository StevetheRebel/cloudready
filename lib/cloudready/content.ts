import type { Concept, Question, TopicId } from "./models";

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

// Populate from the sample only after checking sources and answer keys.
// Empty content is intentional during the foundation stage.
export const questions: readonly Question[] = [];
export const concepts: readonly Concept[] = [];
