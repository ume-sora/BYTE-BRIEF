export type Article = {
  id: string
  title: string
  description: string
  url: string
  urlToImage: string
  publishedAt: string
  source: string
  category: 'AI' | 'Security' | 'Cloud' | 'Dev Tools' | 'Startups' | 'Hardware'
}

function hoursAgo(h: number): string {
  const d = new Date()
  d.setHours(d.getHours() - h)
  return d.toISOString()
}

export const mockArticles: Article[] = [
  {
    id: 'mock-llm-claude-1',
    title: 'Anthropic releases Claude 4 with 200K context and stronger coding benchmarks',
    description:
      'The new model doubles context length and shows significant gains on coding and reasoning evals. Anthropic also announced a lower-cost tier for high-volume API users. Enterprise customers can opt into extended retention for compliance.',
    url: 'https://example.com/1',
    urlToImage: 'https://picsum.photos/seed/mock-llm-claude-1/400/200',
    publishedAt: hoursAgo(2),
    source: 'TechCrunch',
    category: 'AI',
  },
  {
    id: 'mock-breach-health-1',
    title: 'Major health insurer confirms 12M records exposed in third-party breach',
    description:
      'A vendor used for eligibility checks was compromised; names, dates of birth, and member IDs were accessed. The company is offering two years of credit monitoring. Regulators in multiple states have opened inquiries.',
    url: 'https://example.com/2',
    urlToImage: 'https://picsum.photos/seed/mock-breach-health-1/400/200',
    publishedAt: hoursAgo(5),
    source: 'Ars Technica',
    category: 'Security',
  },
  {
    id: 'mock-aws-cost-1',
    title: 'AWS launches Cost Optimizer recommendations for Lambda and ECS',
    description:
      'The new dashboard suggests right-sizing and reserved capacity based on 14 days of usage. Customers report 15–30% projected savings in early tests. The feature is available in all commercial regions at no extra cost.',
    url: 'https://example.com/3',
    urlToImage: 'https://picsum.photos/seed/mock-aws-cost-1/400/200',
    publishedAt: hoursAgo(1),
    source: 'The Verge',
    category: 'Cloud',
  },
  {
    id: 'mock-rust-1',
    title: 'Rust 1.82 stabilizes inline const expressions and improved error messages',
    description:
      'Developers can now use const blocks in more places for zero-cost abstractions. The compiler’s trait error suggestions have been expanded. The release also includes tooling updates for rust-analyzer and Cargo.',
    url: 'https://example.com/4',
    urlToImage: 'https://picsum.photos/seed/mock-rust-1/400/200',
    publishedAt: hoursAgo(8),
    source: 'Ars Technica',
    category: 'Dev Tools',
  },
  {
    id: 'mock-startup-kubernetes-1',
    title: 'Kubernetes platform startup raises $50M to simplify multi-cluster ops',
    description:
      'The round was led by a top-tier VC; the company targets mid-market teams struggling with fleet management. Product focus includes policy-as-code and cost attribution per team. GA is expected later this year.',
    url: 'https://example.com/5',
    urlToImage: 'https://picsum.photos/seed/mock-startup-kubernetes-1/400/200',
    publishedAt: hoursAgo(4),
    source: 'TechCrunch',
    category: 'Startups',
  },
  {
    id: 'mock-nvidia-chip-1',
    title: 'Nvidia announces next-gen data center GPU with 50% better perf-per-watt',
    description:
      'The chip is aimed at AI training and inference workloads; OEMs will ship systems in Q2. Memory bandwidth and NVLink topology have been redesigned. Pricing will be disclosed at launch.',
    url: 'https://example.com/6',
    urlToImage: 'https://picsum.photos/seed/mock-nvidia-chip-1/400/200',
    publishedAt: hoursAgo(3),
    source: 'Wired',
    category: 'Hardware',
  },
  {
    id: 'mock-openai-1',
    title: 'OpenAI makes GPT-4o API available to all paid tiers',
    description:
      'The multimodal model was previously limited to a subset of customers. Rate limits have been increased and pricing is unchanged for the tier. The company also deprecated several legacy models.',
    url: 'https://example.com/7',
    urlToImage: 'https://picsum.photos/seed/mock-openai-1/400/200',
    publishedAt: hoursAgo(6),
    source: 'The Verge',
    category: 'AI',
  },
  {
    id: 'mock-zero-day-1',
    title: 'Critical zero-day in widely used PDF library under active exploitation',
    description:
      'Security vendors have observed exploitation in the wild; patches are available for supported versions. The vulnerability allows remote code execution when opening a crafted file. Organizations are urged to update immediately.',
    url: 'https://example.com/8',
    urlToImage: 'https://picsum.photos/seed/mock-zero-day-1/400/200',
    publishedAt: hoursAgo(1),
    source: 'Ars Technica',
    category: 'Security',
  },
  {
    id: 'mock-gcp-region-1',
    title: 'Google Cloud opens new region in Southeast Asia for low-latency workloads',
    description:
      'The region offers three availability zones and full coverage of major GCP services. Local enterprises and gaming companies are among early adopters. Data residency requirements for the area can now be met on GCP.',
    url: 'https://example.com/9',
    urlToImage: 'https://picsum.photos/seed/mock-gcp-region-1/400/200',
    publishedAt: hoursAgo(12),
    source: 'TechCrunch',
    category: 'Cloud',
  },
  {
    id: 'mock-vscode-1',
    title: 'VS Code adds built-in terminal profiles and improved multi-root support',
    description:
      'Users can define named terminal profiles (e.g. dev, prod) with different shells and env vars. Multi-root workspace handling has been refined for large repos. The update ships in the next stable release.',
    url: 'https://example.com/10',
    urlToImage: 'https://picsum.photos/seed/mock-vscode-1/400/200',
    publishedAt: hoursAgo(7),
    source: 'The Verge',
    category: 'Dev Tools',
  },
  {
    id: 'mock-funding-ai-1',
    title: 'AI infrastructure startup lands $120M Series C for inference platform',
    description:
      'The company provides optimized runtimes and orchestration for deploying LLMs. Investors cite strong demand from Fortune 500 pilots. The funding will go toward GPU capacity and go-to-market in Europe.',
    url: 'https://example.com/11',
    urlToImage: 'https://picsum.photos/seed/mock-funding-ai-1/400/200',
    publishedAt: hoursAgo(9),
    source: 'TechCrunch',
    category: 'Startups',
  },
  {
    id: 'mock-qualcomm-1',
    title: 'Qualcomm unveils Snapdragon X Elite refresh with faster NPU for on-device AI',
    description:
      'The updated SoC targets next-generation Copilot+ and other AI-first laptops. OEMs are expected to announce devices at an upcoming trade show. Battery life and thermal design have been improved.',
    url: 'https://example.com/12',
    urlToImage: 'https://picsum.photos/seed/mock-qualcomm-1/400/200',
    publishedAt: hoursAgo(10),
    source: 'Wired',
    category: 'Hardware',
  },
  {
    id: 'mock-mistral-1',
    title: 'Mistral releases Mixture of Experts model under Apache 2.0',
    description:
      'The open-weight model can be run locally or in the cloud; commercial use is permitted. Benchmarks show competitive performance on code and math. The release includes quantized variants for edge deployment.',
    url: 'https://example.com/13',
    urlToImage: 'https://picsum.photos/seed/mock-mistral-1/400/200',
    publishedAt: hoursAgo(14),
    source: 'Ars Technica',
    category: 'AI',
  },
  {
    id: 'mock-sso-breach-1',
    title: 'SSO vendor breach leads to access tokens for dozens of enterprise customers',
    description:
      'An attacker obtained credentials to a support system and used them to generate valid SAML assertions. Affected organizations have been notified and sessions invalidated. The vendor has engaged a forensics firm.',
    url: 'https://example.com/14',
    urlToImage: 'https://picsum.photos/seed/mock-sso-breach-1/400/200',
    publishedAt: hoursAgo(3),
    source: 'TechCrunch',
    category: 'Security',
  },
  {
    id: 'mock-azure-1',
    title: 'Microsoft Azure adds confidential computing options for regulated workloads',
    description:
      'New VM SKUs use AMD SEV-SNP to keep memory encrypted from the hypervisor. Compliance teams can attest to isolation for sensitive data. The feature is in preview in selected regions.',
    url: 'https://example.com/15',
    urlToImage: 'https://picsum.photos/seed/mock-azure-1/400/200',
    publishedAt: hoursAgo(15),
    source: 'The Verge',
    category: 'Cloud',
  },
  {
    id: 'mock-bun-1',
    title: 'Bun 2.0 ships with native Windows support and faster npm compatibility',
    description:
      'The JavaScript runtime now runs first-class on Windows and passes the npm compatibility test suite. Startup time and cold start metrics have been improved. The team is focusing on production stability next.',
    url: 'https://example.com/16',
    urlToImage: 'https://picsum.photos/seed/mock-bun-1/400/200',
    publishedAt: hoursAgo(11),
    source: 'Ars Technica',
    category: 'Dev Tools',
  },
  {
    id: 'mock-fintech-1',
    title: 'B2B fintech startup secures $35M to expand API banking in Latam',
    description:
      'The round will fund hiring and new product lines for treasury and card issuance. The company has seen strong traction among neobanks and platforms. Expansion into additional countries is planned for next year.',
    url: 'https://example.com/17',
    urlToImage: 'https://picsum.photos/seed/mock-fintech-1/400/200',
    publishedAt: hoursAgo(16),
    source: 'TechCrunch',
    category: 'Startups',
  },
  {
    id: 'mock-amd-1',
    title: 'AMD details next-gen server CPUs with higher core counts and memory bandwidth',
    description:
      'The architecture targets dense virtualization and in-memory databases. OEMs will offer single- and dual-socket configurations. Availability is scheduled for the second half of the year.',
    url: 'https://example.com/18',
    urlToImage: 'https://picsum.photos/seed/mock-amd-1/400/200',
    publishedAt: hoursAgo(18),
    source: 'Wired',
    category: 'Hardware',
  },
  {
    id: 'mock-agents-1',
    title: 'Google DeepMind and Google Research merge agent efforts into single team',
    description:
      'The combined group will focus on general-purpose agents and robotics. Reorg is intended to reduce duplication and speed up product integration. No immediate product name changes were announced.',
    url: 'https://example.com/19',
    urlToImage: 'https://picsum.photos/seed/mock-agents-1/400/200',
    publishedAt: hoursAgo(20),
    source: 'The Verge',
    category: 'AI',
  },
  {
    id: 'mock-supply-chain-1',
    title: 'Software supply chain attack targets popular npm package with 2M weekly downloads',
    description:
      'A maintainer account was compromised and a malicious version was published. The package has been unpublished and registry maintainers are notifying dependents. Security researchers are analyzing the payload.',
    url: 'https://example.com/20',
    urlToImage: 'https://picsum.photos/seed/mock-supply-chain-1/400/200',
    publishedAt: hoursAgo(22),
    source: 'Ars Technica',
    category: 'Security',
  },
]
