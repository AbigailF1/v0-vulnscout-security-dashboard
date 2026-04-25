export type Category = 
  | 'Backend' 
  | 'Frontend' 
  | 'DevOps' 
  | 'Security' 
  | 'Monitoring' 
  | 'Database' 
  | 'AI' 
  | 'CLI' 
  | 'Testing' 
  | 'Data' 
  | 'Mobile' 
  | 'Infrastructure';

export type Ecosystem = 
  | 'npm' 
  | 'PyPI' 
  | 'Go' 
  | 'Maven' 
  | 'crates.io' 
  | 'RubyGems' 
  | 'NuGet' 
  | 'Packagist' 
  | 'Debian' 
  | 'Alpine' 
  | 'Ubuntu' 
  | 'GitHub Actions' 
  | 'Docker';

export type UseCase = 
  | 'Auth' 
  | 'Logging' 
  | 'Observability' 
  | 'Vulnerability scanning' 
  | 'CI/CD' 
  | 'API security' 
  | 'Web framework' 
  | 'Database client'
  | 'Testing'
  | 'Package management'
  | 'Deployment'
  | 'AI tooling'
  | 'Utility'
  | 'API client'
  | 'Data processing'
  | 'Serialization';

export type RiskLevel = 'Not scanned' | 'Safe' | 'Low' | 'Medium' | 'High' | 'Critical';

export type BadgeType = 'Popular' | 'Trending' | 'Infra' | 'Security' | 'New' | 'Essential';

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: Category;
  ecosystem: Ecosystem;
  useCase: UseCase;
  riskLevel: RiskLevel;
  defaultVersion?: string;
  badge?: BadgeType;
  stars?: number;
}

export interface Vulnerability {
  id: string;
  summary: string;
  details: string;
  published: string;
  modified: string;
  severity: string;
  references: string[];
  affectedVersions?: string;
}

export interface ScanResult {
  package: string;
  ecosystem: string;
  version: string;
  vulnerabilityCount: number;
  riskScore: number;
  riskLevel: RiskLevel;
  vulnerabilities: Vulnerability[];
  recommendation: string;
}

export interface ScanRequest {
  name: string;
  ecosystem: string;
  version: string;
}

export interface Filters {
  categories: Category[];
  ecosystems: Ecosystem[];
  useCases: UseCase[];
  search: string;
}

export const CATEGORIES: Category[] = [
  'Backend',
  'Frontend',
  'DevOps',
  'Security',
  'Monitoring',
  'Database',
  'AI',
  'CLI',
  'Testing',
  'Data',
  'Mobile',
  'Infrastructure',
];

export const ECOSYSTEMS: Ecosystem[] = [
  'npm',
  'PyPI',
  'Go',
  'Maven',
  'crates.io',
  'RubyGems',
  'NuGet',
  'Packagist',
  'Debian',
  'Alpine',
  'Ubuntu',
  'GitHub Actions',
  'Docker',
];

export const USE_CASES: UseCase[] = [
  'Auth',
  'Logging',
  'Observability',
  'Vulnerability scanning',
  'CI/CD',
  'API security',
  'Web framework',
  'Database client',
  'Testing',
  'Package management',
  'Deployment',
  'AI tooling',
  'Utility',
  'API client',
  'Data processing',
  'Serialization',
];
