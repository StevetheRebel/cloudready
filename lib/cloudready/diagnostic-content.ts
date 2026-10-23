import { questionSchema, type Question, type TopicId } from "./models";
import { learningSupport } from "./explanations";

const base = "https://learn.microsoft.com/en-us/training/modules/";
function question(
  id: string,
  topicId: TopicId,
  conceptId: string,
  text: string,
  options: [string, string][],
  correctOptionId: string,
  explanation: string,
  sourcePath: string,
  sourceTitle: string,
): Question {
  return questionSchema.parse({
    id,
    topicId,
    conceptId,
    text,
    correctOptionId,
    explanation,
    simplerExplanation: learningSupport[conceptId]?.simpler,
    localScenario: learningSupport[conceptId]?.local,
    options: options.map(([text, explanation], index) => ({
      id: String.fromCharCode(97 + index),
      text,
      explanation,
    })),
    source: {
      title: sourceTitle,
      url: base + sourcePath,
      reviewedAt: "2026-10-23",
    },
    difficulty: "introductory",
  });
}

// Original learning questions, not official exam items. Keys checked against the linked sources.
export const diagnosticQuestions: readonly Question[] = [
  question(
    "diag-responsibility-1",
    "cloud-concepts",
    "shared-responsibility",
    "A team moves its application to a cloud provider. Which responsibility always remains with the customer?",
    [
      [
        "Securing the physical datacentre",
        "The provider protects its physical facilities.",
      ],
      [
        "Managing its information and data",
        "The customer remains responsible for its data.",
      ],
      ["Replacing physical servers", "The provider maintains physical hosts."],
      [
        "Maintaining datacentre cooling",
        "Cooling is part of the provider's infrastructure.",
      ],
    ],
    "b",
    "Service models shift operational duties, but customers retain responsibility for their information and data.",
    "describe-cloud-compute/4-describe-shared-responsibility-model",
    "Shared responsibility",
  ),
  question(
    "diag-hybrid-1",
    "cloud-concepts",
    "cloud-deployment-models",
    "A fictional retailer connects its private cloud to public-cloud resources for seasonal demand. Which deployment model is this?",
    [
      ["Public cloud only", "The scenario also includes a private cloud."],
      ["Private cloud only", "The scenario also uses public-cloud resources."],
      [
        "Hybrid cloud",
        "Hybrid connects private and public cloud environments.",
      ],
      ["Multicloud only", "Multiple public providers are not described."],
    ],
    "c",
    "A connected private and public cloud environment is hybrid cloud.",
    "describe-cloud-compute/5-define-cloud-models",
    "Cloud deployment models",
  ),
  question(
    "diag-consumption-1",
    "cloud-concepts",
    "consumption-based-pricing",
    "Which statement best describes consumption-based cloud pricing?",
    [
      [
        "Charges depend on the resources consumed",
        "Consumption-based charges follow usage.",
      ],
      [
        "Every customer pays the same fixed bill",
        "Bills vary with usage and service choices.",
      ],
      [
        "All resources are free after deployment",
        "Deployment does not remove service charges.",
      ],
      [
        "You must buy the provider's physical servers",
        "You consume services rather than purchasing its hosts.",
      ],
    ],
    "a",
    "Consumption-based pricing charges for use. Resource configuration and pricing terms still matter.",
    "describe-cloud-compute/6-describe-consumption-based-model",
    "Consumption-based pricing",
  ),
  question(
    "diag-paas-1",
    "cloud-concepts",
    "cloud-service-models",
    "Developers want to deploy their own code while the provider manages the operating system and runtime. Which model fits?",
    [
      [
        "On-premises hosting",
        "The organisation normally manages its own platform.",
      ],
      [
        "Infrastructure as a service",
        "Customers still manage the guest operating system.",
      ],
      ["Software as a service", "SaaS supplies a finished application."],
      [
        "Platform as a service",
        "PaaS provides a managed platform for customer applications.",
      ],
    ],
    "d",
    "PaaS lets developers focus on application code while the provider maintains platform components.",
    "describe-cloud-service-types/3-describe-platform-service",
    "Platform as a service",
  ),
  question(
    "diag-region-1",
    "azure-services",
    "azure-regions",
    "What is an Azure region?",
    [
      ["A billing label", "Regions describe physical infrastructure."],
      [
        "A geographic area containing connected datacentres",
        "Nearby datacentres are linked by low-latency networks.",
      ],
      [
        "A collection of subscriptions",
        "Management groups organise subscriptions.",
      ],
      [
        "A permission assigned to a user",
        "A permission is not a geographic location.",
      ],
    ],
    "b",
    "Regions group nearby datacentres within a geographic area.",
    "describe-core-architectural-components-of-azure/5-describe-azure-physical-infrastructure",
    "Azure physical infrastructure",
  ),
  question(
    "diag-zone-1",
    "azure-services",
    "availability-zones",
    "Which Azure feature provides physically separate datacentre locations within one region?",
    [
      ["Resource tags", "Tags are metadata."],
      ["Subscriptions", "Subscriptions are management and billing boundaries."],
      [
        "Availability zones",
        "Zones have independent power, cooling, and networking.",
      ],
      ["Management groups", "These organise subscriptions, not datacentres."],
    ],
    "c",
    "Availability zones provide physical isolation within a region. Workloads must be configured to use that resilience.",
    "describe-core-architectural-components-of-azure/5-describe-azure-physical-infrastructure",
    "Azure physical infrastructure",
  ),
  question(
    "diag-resource-group-1",
    "azure-services",
    "resource-groups",
    "Which container groups related Azure resources for management?",
    [
      ["Resource group", "Resource groups contain related resources."],
      ["Availability zone", "A zone is physical infrastructure."],
      ["Pricing calculator", "The calculator estimates costs."],
      ["Resource lock", "A lock restricts changes; it is not a container."],
    ],
    "a",
    "Resource groups organise related resources within a subscription.",
    "describe-core-architectural-components-of-azure/6-describe-azure-management-infrastructure",
    "Azure management infrastructure",
  ),
  question(
    "diag-management-group-1",
    "azure-services",
    "management-groups",
    "A team wants common governance across several Azure subscriptions. Which scope groups those subscriptions?",
    [
      ["One resource group", "Resource groups sit inside subscriptions."],
      ["One availability zone", "Zones are datacentre locations."],
      [
        "One resource tag",
        "Tags label resources rather than grouping subscriptions hierarchically.",
      ],
      ["A management group", "Management groups sit above subscriptions."],
    ],
    "d",
    "Management groups provide a governance scope for multiple subscriptions.",
    "describe-core-architectural-components-of-azure/6-describe-azure-management-infrastructure",
    "Azure management infrastructure",
  ),
  question(
    "diag-pricing-1",
    "management-governance",
    "pricing-calculator",
    "A fictional startup wants an Azure cost estimate before deploying resources. Which tool should it use?",
    [
      ["Resource locks", "Locks restrict resource changes."],
      [
        "Azure Pricing calculator",
        "It estimates costs for a planned configuration.",
      ],
      ["Availability zones", "Zones provide physical isolation."],
      [
        "Resource groups",
        "Groups organise resources; they do not calculate estimates.",
      ],
    ],
    "b",
    "The Pricing calculator estimates potential spending. Building an estimate does not provision resources or guarantee a future bill.",
    "describe-cost-management-azure/3-compare-pricing-total-cost-of-ownership-calculators",
    "Azure Pricing calculator",
  ),
  question(
    "diag-tags-1",
    "management-governance",
    "resource-tags",
    "A team needs CostCenter labels to organise cost reports. Which Azure feature supplies name/value metadata?",
    [
      ["Availability zones", "Zones isolate datacentre locations."],
      ["ReadOnly locks", "Locks restrict updates and deletion."],
      ["Resource tags", "Tags attach name/value metadata."],
      ["Regions", "Regions locate infrastructure geographically."],
    ],
    "c",
    "Tags such as CostCenter support organisation and cost allocation. They do not automatically inherit from resource groups.",
    "describe-cost-management-azure/7-describe-purpose-of-tags",
    "Resource tags",
  ),
  question(
    "diag-policy-1",
    "management-governance",
    "azure-policy",
    "Which service can audit resource configuration and deny deployments outside allowed Azure regions?",
    [
      [
        "Azure Policy",
        "Policy can evaluate configurations and deny noncompliant deployments.",
      ],
      [
        "Pricing calculator",
        "Cost estimates do not enforce configuration rules.",
      ],
      ["Resource tags alone", "Labels alone do not enforce allowed locations."],
      ["Availability zones", "Zones do not enforce deployment policies."],
    ],
    "a",
    "Azure Policy applies configuration standards through policy definitions and assignments.",
    "describe-features-tools-azure-for-governance-compliance/3-describe-purpose-azure-policy",
    "Azure Policy",
  ),
  question(
    "diag-lock-1",
    "management-governance",
    "resource-locks",
    "A team wants to prevent accidental deletion while allowing authorised updates. Which resource lock fits?",
    [
      ["ReadOnly", "ReadOnly also blocks updates."],
      ["A CostCenter tag", "Tags do not block deletion."],
      ["No lock", "This adds no protection against accidental deletion."],
      [
        "Delete (CanNotDelete)",
        "This blocks deletion while permitting authorised reads and updates.",
      ],
    ],
    "d",
    "A Delete lock protects against deletion. ReadOnly is stricter because it also prevents updates.",
    "describe-features-tools-azure-for-governance-compliance/4-describe-purpose-resource-locks",
    "Resource locks",
  ),
];
