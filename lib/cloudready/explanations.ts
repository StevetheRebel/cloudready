import type { Profile, Question } from "./models";

export type ExplanationFormat = "standard" | "simpler" | "local" | "ai";
type Support = { simpler: string; local: string };

// Original teaching examples; organisations and events below are fictional.
// These clarify the same concepts and source-checked answer keys as the question bank.
export const learningSupport: Readonly<Record<string, Support>> = {
  "shared-responsibility": {
    simpler:
      "The provider looks after the physical equipment. You still look after your information and who can use it.",
    local:
      "Mwangaza Books, a fictional Nairobi bookshop, moves customer records to the cloud. The provider maintains the servers; the shop still decides which staff may access customer data.",
  },
  "cloud-deployment-models": {
    simpler:
      "Hybrid means connecting a private cloud with a public cloud. Using several public-cloud providers is a different idea: multicloud.",
    local:
      "A fictional Kisumu retailer connects its private cloud to Azure to handle a seasonal sales rush. Because private and public environments work together, this is a hybrid setup.",
  },
  "consumption-based-pricing": {
    simpler:
      "You are charged for what you use under the service's pricing terms. More usage can mean a larger bill; cloud services are not automatically free.",
    local:
      "A fictional Mombasa delivery firm runs extra cloud compute during busy periods. Its consumption charges reflect the resources used, rather than everyone paying an identical bill.",
  },
  "cloud-service-models": {
    simpler:
      "With PaaS, you bring your application code. The provider runs the operating system and platform underneath it.",
    local:
      "Developers at a fictional Eldoret training centre deploy their own booking app to a managed platform. They maintain their code and data while the provider maintains the underlying operating system.",
  },
  "azure-regions": {
    simpler:
      "A region is a geographic area with nearby, connected datacentres. It describes where infrastructure is located, not who pays the bill.",
    local:
      "A fictional Nairobi software team chooses a supported Azure region for a deployment. It is choosing a geographic infrastructure location, not a billing label. Service availability still needs checking.",
  },
  "availability-zones": {
    simpler:
      "Zones are physically separate datacentre locations inside one region, with independent power and cooling. Your workload must be configured to use them.",
    local:
      "A fictional Kenyan ticketing service uses a zone-supported design within its chosen Azure region. Separating components across zones can help it withstand a zone failure; simply choosing a region does not do this automatically.",
  },
  "resource-groups": {
    simpler:
      "A resource group is a management container for related Azure resources. It is not a physical datacentre.",
    local:
      "A fictional Nakuru college puts its training app's related resources in a resource group. Staff can manage that set together without treating the group as a geographic location.",
  },
  "management-groups": {
    simpler:
      "Management groups sit above subscriptions. They let you apply common governance to several subscriptions together.",
    local:
      "A fictional education organisation has separate subscriptions for its campuses. A management group gives the organisation a shared scope for governance across those subscriptions.",
  },
  "pricing-calculator": {
    simpler:
      "The Pricing calculator estimates a planned Azure bill. Creating an estimate does not deploy resources or guarantee the actual amount charged.",
    local:
      "A fictional Nairobi startup models compute and storage in the Pricing calculator before budgeting for a pilot. It gets an estimate, without creating those resources by using the calculator.",
  },
  "resource-tags": {
    simpler:
      "Tags are name/value labels, such as CostCenter = Training. They help organise reports but do not automatically block unwanted deployments.",
    local:
      "A fictional Kisii training business tags supported resources with CostCenter = Classes to organise cost reports. It checks the resources directly because resource-group tags are not automatically inherited.",
  },
  "azure-policy": {
    simpler:
      "Azure Policy checks resource configuration against rules. A policy with a deny effect can stop a deployment that breaks the assigned rule.",
    local:
      "A fictional Kenyan software cooperative assigns an allowed-locations policy. The policy can deny a new deployment outside its approved regions; adding a region name as a tag would not enforce that rule.",
  },
  "resource-locks": {
    simpler:
      "A Delete lock stops deletion while allowing authorised updates. A ReadOnly lock also stops updates. Someone with the right permissions can remove a lock.",
    local:
      "A fictional Thika training hub uses a Delete lock to reduce accidental deletion of a resource while allowing authorised updates. The team would need a stricter ReadOnly lock to block updates too.",
  },
};

export function preferredExplanation(
  style: Profile["preferences"]["explanationStyle"],
): ExplanationFormat {
  return style === "example-first"
    ? "local"
    : style === "concise"
      ? "simpler"
      : "standard";
}

export function explanationContent(
  question: Question,
  format: ExplanationFormat,
  online = true,
) {
  const support = learningSupport[question.conceptId];
  if (format === "ai")
    return {
      text:
        question.simplerExplanation ?? support?.simpler ?? question.explanation,
      notice: online
        ? "AI explanations are not connected in this demo. Here is a source-checked explanation instead."
        : "You appear to be offline. AI help is unavailable; this page's source-checked explanation is still available. External source links need an internet connection.",
      fictional: false,
    };
  if (format === "local") {
    const example = question.localScenario ?? support?.local;
    return {
      text: example ?? question.explanation,
      notice: example
        ? null
        : "A local example is not available for this question. Showing the standard explanation instead.",
      fictional: Boolean(example),
    };
  }
  if (format === "simpler") {
    const simpler = question.simplerExplanation ?? support?.simpler;
    return {
      text: simpler ?? question.explanation,
      notice: simpler
        ? null
        : "A simpler explanation is not available for this question. Showing the standard explanation instead.",
      fictional: false,
    };
  }
  return { text: question.explanation, notice: null, fictional: false };
}
