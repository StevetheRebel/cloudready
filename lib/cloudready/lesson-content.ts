import type { Concept } from "./models";
import { diagnosticQuestions } from "./diagnostic-content";

type LessonNotes = {
  title: string;
  objective: string;
  explanation: string;
  keyTerms: string[];
  comparison: Concept["comparison"];
  misunderstanding: string;
  sourceUrl?: string;
};
const notes: Record<string, LessonNotes> = {
  "shared-responsibility": {
    title: "Shared responsibility",
    objective: "Separate customer duties from provider duties.",
    explanation:
      "Start with the service model, then ask which layer is being managed. Moving to cloud shifts infrastructure work, but does not transfer ownership of your information or decisions about access.",
    keyTerms: ["Customer", "Provider", "Data", "Access"],
    comparison: [
      {
        label: "Provider",
        detail: "Maintains physical datacentres, hosts, power, and cooling.",
      },
      {
        label: "Customer",
        detail: "Remains responsible for its information and data.",
      },
    ],
    misunderstanding:
      "Using a managed service does not remove every customer responsibility.",
  },
  "cloud-deployment-models": {
    title: "Cloud deployment models",
    objective:
      "Distinguish private, public, hybrid, and multicloud environments.",
    explanation:
      "Classify the environments being connected. A private cloud serves one organisation; a public cloud supplies services through a provider. Connecting private and public environments is hybrid. Using multiple public providers is multicloud.",
    keyTerms: ["Public", "Private", "Hybrid", "Multicloud"],
    comparison: [
      {
        label: "Hybrid",
        detail: "Connects private and public cloud environments.",
      },
      {
        label: "Multicloud",
        detail: "Uses more than one public-cloud provider.",
      },
    ],
    misunderstanding: "Hybrid does not simply mean using two public providers.",
  },
  "consumption-based-pricing": {
    title: "Consumption-based pricing",
    objective: "Explain the link between consumption and cloud charges.",
    explanation:
      "Consumption-based services charge according to use and their pricing terms. Releasing unneeded resources can reduce consumption, but other billable resources may remain. Check what you provision and monitor usage rather than assuming a universal fixed bill.",
    keyTerms: ["Usage", "Consumption", "Operating expense"],
    comparison: [
      {
        label: "Consumption",
        detail: "Spending follows the services and quantities consumed.",
      },
      {
        label: "Hardware purchase",
        detail: "Requires an upfront purchase of infrastructure.",
      },
    ],
    misunderstanding: "Deploying once does not make ongoing cloud usage free.",
  },
  "cloud-service-models": {
    title: "Cloud service models",
    objective: "Recognise what PaaS manages for an application team.",
    explanation:
      "In PaaS, the provider operates the platform, including the operating system and managed runtime. Developers remain responsible for their application code and data. Compare that with IaaS, where the customer also maintains the guest operating system.",
    keyTerms: ["IaaS", "PaaS", "SaaS", "Runtime"],
    comparison: [
      {
        label: "IaaS",
        detail: "Customer manages the guest operating system and applications.",
      },
      {
        label: "PaaS",
        detail:
          "Provider manages the platform; customer supplies application code.",
      },
    ],
    misunderstanding:
      "PaaS is not the same as buying a finished SaaS application.",
  },
  "azure-regions": {
    title: "Azure regions",
    objective: "Distinguish a region from an administrative scope.",
    explanation:
      "A region groups connected datacentres in a geographic area. Choose a supported location with workload needs in mind, including latency, residency, and service availability. A subscription or resource group does not describe a physical datacentre location.",
    keyTerms: ["Region", "Geography", "Datacentre"],
    comparison: [
      { label: "Region", detail: "Geographic infrastructure location." },
      { label: "Subscription", detail: "Management and billing scope." },
    ],
    misunderstanding:
      "Not every service or resilience option is available in every region.",
    sourceUrl:
      "https://learn.microsoft.com/en-us/azure/reliability/regions-overview",
  },
  "availability-zones": {
    title: "Availability zones",
    objective: "Explain physical isolation within one region.",
    explanation:
      "Availability zones have independent infrastructure within a region. Some services distribute across zones automatically; others need configuration. A single zonal deployment is not automatically protected from failure of its own zone.",
    keyTerms: ["Zone", "Zonal", "Zone-redundant"],
    comparison: [
      {
        label: "Zonal",
        detail: "A resource is deployed into one selected zone.",
      },
      {
        label: "Zone-redundant",
        detail: "The service distributes or replicates across zones.",
      },
    ],
    misunderstanding:
      "Choosing a region alone does not guarantee zone resilience.",
    sourceUrl:
      "https://learn.microsoft.com/en-us/azure/reliability/availability-zones-overview",
  },
  "resource-groups": {
    title: "Resource groups",
    objective: "Identify a container for managing related Azure resources.",
    explanation:
      "A resource group holds related Azure resources so they can be managed together. It belongs to a subscription. Treat lifecycle operations carefully: deleting the group also deletes the resources it contains.",
    keyTerms: ["Resource", "Resource group", "Lifecycle"],
    comparison: [
      { label: "Resource", detail: "An individual deployed Azure item." },
      {
        label: "Resource group",
        detail: "A management container for related resources.",
      },
    ],
    misunderstanding: "A resource group is not an availability zone.",
    sourceUrl:
      "https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/manage-resource-groups-portal",
  },
  "management-groups": {
    title: "Management groups",
    objective: "Choose a governance scope above subscriptions.",
    explanation:
      "Management groups organise subscriptions under a shared governance scope. Policies and access assignments at that scope can inherit down the hierarchy. They address organisation across subscriptions rather than physical datacentre placement.",
    keyTerms: ["Governance", "Subscription", "Inheritance"],
    comparison: [
      {
        label: "Management group",
        detail: "Organises subscriptions for shared governance.",
      },
      {
        label: "Resource group",
        detail: "Organises resources within a subscription.",
      },
    ],
    misunderstanding:
      "A tag is metadata, not a substitute for the management-group hierarchy.",
    sourceUrl:
      "https://learn.microsoft.com/en-us/azure/governance/management-groups/overview",
  },
  "pricing-calculator": {
    title: "Pricing calculator",
    objective: "Distinguish an estimate from a deployment or actual bill.",
    explanation:
      "Model a proposed configuration in the Pricing calculator before deployment. Compare estimates as assumptions change. The calculator does not create resources, and estimated spending is not a guarantee of actual charges.",
    keyTerms: ["Estimate", "Configuration", "Actual usage"],
    comparison: [
      {
        label: "Estimate",
        detail: "Models expected spending from chosen assumptions.",
      },
      {
        label: "Actual bill",
        detail: "Reflects services consumed and applicable pricing terms.",
      },
    ],
    misunderstanding:
      "Adding resources to the calculator does not provision or purchase them.",
  },
  "resource-tags": {
    title: "Resource tags",
    objective: "Use labels to organise resources and cost reporting.",
    explanation:
      "Tags attach name/value metadata, such as Owner or CostCenter, to supported resources. They help classify and report. Resources do not automatically inherit tags from their resource group; enforcement requires a separate mechanism such as policy.",
    keyTerms: ["Name/value", "CostCenter", "Metadata"],
    comparison: [
      {
        label: "Tag",
        detail: "Labels a resource for organisation and reporting.",
      },
      { label: "Policy", detail: "Can enforce rules about required tags." },
    ],
    misunderstanding:
      "A resource-group tag does not automatically appear on each resource.",
  },
  "azure-policy": {
    title: "Azure Policy",
    objective: "Recognise configuration auditing and enforcement.",
    explanation:
      "Azure Policy evaluates resources against assigned rules. Depending on the definition and effect, it can audit configurations or deny noncompliant deployments. Start with the configuration requirement, then choose the appropriate policy effect.",
    keyTerms: ["Definition", "Assignment", "Audit", "Deny"],
    comparison: [
      {
        label: "Audit",
        detail: "Identifies configurations that do not meet a rule.",
      },
      {
        label: "Deny",
        detail: "Blocks a noncompliant operation covered by the policy.",
      },
    ],
    misunderstanding:
      "A descriptive tag alone does not enforce an allowed-region rule.",
  },
  "resource-locks": {
    title: "Resource locks",
    objective: "Choose between Delete and ReadOnly protection.",
    explanation:
      "A Delete lock blocks deletion while allowing authorised updates. ReadOnly also blocks updates. Locks protect against accidental management changes, but authorised users can remove them; they are not a substitute for access governance.",
    keyTerms: ["Delete", "ReadOnly", "Permissions"],
    comparison: [
      {
        label: "Delete",
        detail: "Prevents deletion; authorised updates remain possible.",
      },
      { label: "ReadOnly", detail: "Prevents updates and deletion." },
    ],
    misunderstanding: "A Delete lock does not make a resource read-only.",
  },
};

export const lessonConcepts: readonly Concept[] = diagnosticQuestions.map(
  (question) => {
    const lesson = notes[question.conceptId];
    return {
      id: question.conceptId,
      slug: question.conceptId,
      topicId: question.topicId,
      title: lesson.title,
      summary: lesson.objective,
      objective: lesson.objective,
      readingMinutes: 3,
      explanation: lesson.explanation,
      keyTerms: lesson.keyTerms,
      comparison: lesson.comparison,
      localScenario: question.localScenario!,
      misunderstandings: [lesson.misunderstanding],
      recap: question.simplerExplanation!,
      source: {
        ...question.source,
        title: lesson.title,
        url: lesson.sourceUrl ?? question.source.url,
        reviewedAt: "2026-10-23",
      },
      knowledgeCheckIds: [question.id],
    };
  },
);
