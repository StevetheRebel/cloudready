import { diagnosticQuestions } from "./diagnostic-content";
import { questionSchema } from "./models";

function item(
  id: string,
  conceptId: string,
  text: string,
  options: [string, string][],
  correct: number,
  explanation: string,
  sourceUrl?: string,
) {
  const base = diagnosticQuestions.find(
    (question) => question.conceptId === conceptId,
  )!;
  return questionSchema.parse({
    ...base,
    id,
    text,
    options: options.map(([text, explanation], index) => ({
      id: String.fromCharCode(97 + index),
      text,
      explanation,
    })),
    correctOptionId: String.fromCharCode(97 + correct),
    explanation,
    source: {
      ...base.source,
      title: conceptId.replace(/-/g, " "),
      url: sourceUrl ?? base.source.url,
    },
  });
}
const models = "cloud-deployment-models";
const groups = "resource-groups";
const regionSource =
  "https://learn.microsoft.com/en-us/azure/reliability/regions-overview";
const iaas =
  "https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/2-describe-infrastructure-service";
export const practiceQuestions = [
  item(
    "practice-responsibility-1",
    "shared-responsibility",
    "A fictional clinic uses a managed cloud application. Who decides which staff should access its patient information?",
    [
      [
        "Only the datacentre electrician",
        "Physical maintenance does not decide clinical access.",
      ],
      ["The clinic", "The customer controls access to its information."],
      ["Nobody", "Access still needs management."],
      [
        "Only the hardware supplier",
        "Hardware ownership does not transfer data responsibility.",
      ],
    ],
    1,
    "Using a managed application does not remove the customer's responsibility for its information and access decisions.",
  ),
  item(
    "practice-models-1",
    models,
    "A business runs workloads with two public-cloud providers, with no private cloud described. Which term best fits?",
    [
      ["Multicloud", "More than one public provider is used."],
      ["Private cloud", "Public providers are described."],
      ["Hybrid by definition", "No private-public connection is described."],
      ["A resource group", "This is not a deployment model."],
    ],
    0,
    "Multicloud refers to using multiple public-cloud providers.",
  ),
  item(
    "practice-models-2",
    models,
    "A cloud environment is dedicated to a single organisation. Which deployment model does that describe?",
    [
      ["Public", "Public services are available to customers generally."],
      ["Multicloud", "Provider count is not specified."],
      ["Private", "A private cloud serves one organisation."],
      ["Hybrid necessarily", "No public-private combination is described."],
    ],
    2,
    "Private cloud describes an environment dedicated to one organisation; it need not be in that organisation's own building.",
  ),
  item(
    "practice-consumption-1",
    "consumption-based-pricing",
    "A team reduces consumption of a metered cloud service. What should it check before assuming its entire cloud bill is zero?",
    [
      ["Only its logo", "Branding does not determine charges."],
      [
        "Whether Azure regions exist",
        "Regions do not remove consumption charges.",
      ],
      ["Nothing", "Other consumption may remain."],
      [
        "Remaining billable resources and pricing terms",
        "Other resources may still generate charges.",
      ],
    ],
    3,
    "Consumption charges depend on the resources and services used; reducing one service does not eliminate every charge.",
  ),
  item(
    "practice-services-1",
    "cloud-service-models",
    "A team rents an IaaS virtual machine. Who normally maintains the guest operating system?",
    [
      ["The customer", "IaaS customers maintain the guest OS."],
      ["Only the physical host vendor", "The guest OS is a customer duty."],
      ["Nobody", "The guest OS still needs maintenance."],
      [
        "The provider in every service model",
        "Responsibilities depend on the model.",
      ],
    ],
    0,
    "IaaS supplies infrastructure while the customer maintains the guest operating system and applications.",
    iaas,
  ),
  item(
    "practice-services-2",
    "cloud-service-models",
    "A team needs control over its guest OS configuration. Which cloud model most directly supplies that control?",
    [
      ["A finished SaaS app", "SaaS supplies the application."],
      ["IaaS", "The customer manages the guest OS."],
      ["PaaS exclusively", "The platform OS is provider-managed."],
      ["A cost tag", "Metadata is not a service model."],
    ],
    1,
    "IaaS offers control over guest operating systems; that control also brings maintenance responsibility.",
    iaas,
  ),
  item(
    "practice-regions-1",
    "azure-regions",
    "Before selecting an Azure region for a workload, which check is useful?",
    [
      [
        "Whether every service exists everywhere",
        "Services can differ by region.",
      ],
      [
        "Whether subscriptions are datacentres",
        "Subscriptions are administrative scopes.",
      ],
      [
        "Whether required services are available there",
        "Region support affects deployment choices.",
      ],
      [
        "Whether the name matches the company",
        "Names do not establish suitability.",
      ],
    ],
    2,
    "Region selection should consider required service availability as well as workload location needs.",
    regionSource,
  ),
  item(
    "practice-regions-2",
    "azure-regions",
    "A team wants to place a regional workload geographically closer to its users. Which choice most directly addresses location?",
    [
      [
        "Selecting a suitable Azure region",
        "A region identifies infrastructure location.",
      ],
      ["Renaming a tag", "A label does not move infrastructure."],
      [
        "Renaming a subscription",
        "An administrative name does not set location.",
      ],
      ["Adding a Delete lock", "A lock does not choose geography."],
    ],
    0,
    "Regions describe geographic infrastructure locations; administrative labels do not relocate workloads.",
    regionSource,
  ),
  item(
    "practice-zones-1",
    "availability-zones",
    "A workload runs in a single availability zone. Does that alone make it resilient to failure of that zone?",
    [
      [
        "Yes, every zonal resource spans all zones",
        "A zonal resource uses one zone.",
      ],
      ["Yes, a tag guarantees it", "Metadata provides no failover."],
      [
        "Yes, a subscription guarantees it",
        "Subscriptions do not supply this topology.",
      ],
      [
        "No; resilience depends on service and deployment design",
        "Zone resilience requires appropriate distribution.",
      ],
    ],
    3,
    "A single zonal deployment is not automatically protected from failure of its own zone.",
    "https://learn.microsoft.com/en-us/azure/reliability/availability-zones-overview",
  ),
  item(
    "practice-groups-1",
    groups,
    "What happens to the resources inside an Azure resource group when that group is deleted?",
    [
      [
        "They all become management groups",
        "Deletion does not change their type.",
      ],
      [
        "They are deleted with the group",
        "Group deletion includes its resources.",
      ],
      [
        "They automatically move to another subscription",
        "Deletion is not a move.",
      ],
      [
        "Only their tags are removed",
        "Deletion affects the resources themselves.",
      ],
    ],
    1,
    "Deleting a resource group deletes its contained resources; treat lifecycle actions carefully.",
  ),
  item(
    "practice-groups-2",
    groups,
    "Can Azure resource groups be nested inside other resource groups?",
    [
      ["Yes, to any depth", "Resource groups do not nest."],
      ["Only when renamed", "Renaming does not allow nesting."],
      ["No", "Resources belong to groups within subscriptions."],
      ["Only with a CostCenter tag", "Tags do not alter the hierarchy."],
    ],
    2,
    "Resource groups cannot be nested; management groups provide a different level above subscriptions.",
  ),
  item(
    "practice-management-1",
    "management-groups",
    "A governance rule is assigned at a management group. Which descendants can inherit it?",
    [
      [
        "Its associated subscriptions and resources",
        "Governance can cascade down the hierarchy.",
      ],
      ["Only unrelated public providers", "They are outside the hierarchy."],
      ["Only physical cooling systems", "This is an administrative scope."],
      ["No descendants", "Inheritance is a key purpose of this scope."],
    ],
    0,
    "Management groups provide governance across their descendant subscriptions and resources.",
    "https://learn.microsoft.com/en-us/azure/governance/management-groups/overview",
  ),
  item(
    "practice-pricing-1",
    "pricing-calculator",
    "A team adds proposed resources to the Azure Pricing calculator. Have those resources now been deployed?",
    [
      ["Yes, automatically", "Estimation does not deploy resources."],
      [
        "Only when a region is chosen",
        "A regional estimate is still an estimate.",
      ],
      ["Only if tags are entered", "Labels do not trigger deployment."],
      ["No", "The tool models potential spending."],
    ],
    3,
    "The Pricing calculator produces estimates without provisioning the listed resources.",
  ),
  item(
    "practice-tags-1",
    "resource-tags",
    "An Owner tag is applied to a resource group. Will its resources automatically receive the same tag?",
    [
      ["No", "Resource tags are not automatically inherited."],
      ["Yes, always", "Inheritance is not automatic."],
      [
        "Only if all tag names match",
        "Matching tag names do not create inheritance.",
      ],
      [
        "Only if the group contains VMs",
        "Resource type does not establish automatic inheritance.",
      ],
    ],
    0,
    "Tags on a resource group do not automatically appear on each resource.",
  ),
  item(
    "practice-tags-2",
    "resource-tags",
    "Which label could help allocate Azure costs to an internal department?",
    [
      [
        "A zone number alone",
        "Physical placement does not identify a department.",
      ],
      [
        "CostCenter = Training",
        "A name/value tag can classify departmental costs.",
      ],
      ["ReadOnly", "That is a lock type, not cost metadata."],
      [
        "A blank policy assignment",
        "A blank assignment does not supply the label.",
      ],
    ],
    1,
    "Resource tags can organise cost reporting using names and values such as a cost centre.",
  ),
  item(
    "practice-policy-1",
    "azure-policy",
    "A team wants to identify configurations that do not meet a rule without using a deny effect. Which policy effect fits this purpose?",
    [
      ["Rename", "Renaming is not the audit effect."],
      ["Delete lock", "A lock is a different control."],
      ["Audit", "Audit identifies noncompliant configurations."],
      ["CostCenter", "This is a metadata label."],
    ],
    2,
    "An audit effect reports noncompliance; a deny effect can block covered noncompliant operations.",
  ),
  item(
    "practice-policy-2",
    "azure-policy",
    "What is an Azure Policy initiative?",
    [
      ["A physical datacentre", "Infrastructure location is unrelated."],
      ["A cloud pricing invoice", "Invoices report spending."],
      ["A guest operating system", "An OS is not a governance grouping."],
      [
        "A group of related policy definitions",
        "Initiatives collect related policies.",
      ],
    ],
    3,
    "An initiative groups related policy definitions for a shared governance goal.",
  ),
  item(
    "practice-locks-1",
    "resource-locks",
    "A team wants to block both updates and deletion through a resource lock. Which lock should it choose?",
    [
      ["ReadOnly", "It blocks updates and deletion."],
      ["Delete only", "Authorised updates remain possible."],
      ["Owner tag", "Metadata does not lock resources."],
      ["No lock", "No lock provides no such restriction."],
    ],
    0,
    "ReadOnly is stricter than Delete because it also prevents updates.",
  ),
];
