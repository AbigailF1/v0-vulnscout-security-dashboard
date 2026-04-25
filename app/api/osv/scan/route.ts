import { NextRequest, NextResponse } from 'next/server';
import type { ScanResult, RiskLevel, Vulnerability } from '@/lib/types';

interface OSVVulnerability {
  id: string;
  summary?: string;
  details?: string;
  published?: string;
  modified?: string;
  severity?: Array<{
    type: string;
    score: string;
  }>;
  references?: Array<{
    type: string;
    url: string;
  }>;
}

interface OSVResponse {
  vulns?: OSVVulnerability[];
}

function computeRisk(vulnerabilityCount: number): { score: number; level: RiskLevel } {
  if (vulnerabilityCount === 0) {
    return { score: 0, level: 'Safe' };
  } else if (vulnerabilityCount === 1) {
    return { score: 30, level: 'Low' };
  } else if (vulnerabilityCount <= 3) {
    return { score: 60, level: 'Medium' };
  } else if (vulnerabilityCount <= 6) {
    return { score: 80, level: 'High' };
  } else {
    return { score: 95, level: 'Critical' };
  }
}

function getRecommendation(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case 'Safe':
      return 'No known vulnerabilities found. This version appears safe to use.';
    case 'Low':
      return 'Minor vulnerability detected. Review advisories before using in production.';
    case 'Medium':
      return 'Multiple vulnerabilities found. Consider upgrading to a patched version.';
    case 'High':
      return 'Significant vulnerabilities detected. Upgrade to a patched version immediately.';
    case 'Critical':
      return 'Critical security issues found. Avoid this version in production environments.';
    default:
      return 'Scan the package to check for vulnerabilities.';
  }
}

function extractSeverity(vuln: OSVVulnerability): string {
  if (vuln.severity && vuln.severity.length > 0) {
    const cvss = vuln.severity.find(s => s.type === 'CVSS_V3' || s.type === 'CVSS_V2');
    if (cvss) {
      const score = parseFloat(cvss.score);
      if (score >= 9.0) return 'Critical';
      if (score >= 7.0) return 'High';
      if (score >= 4.0) return 'Medium';
      if (score >= 0.1) return 'Low';
    }
  }
  return 'Unknown';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, ecosystem, version } = body;

    if (!name || !ecosystem || !version) {
      return NextResponse.json(
        { error: 'Missing required fields: name, ecosystem, version' },
        { status: 400 }
      );
    }

    const osvResponse = await fetch('https://api.osv.dev/v1/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        package: {
          name,
          ecosystem,
        },
        version,
      }),
    });

    if (!osvResponse.ok) {
      throw new Error(`OSV API error: ${osvResponse.status}`);
    }

    const data: OSVResponse = await osvResponse.json();
    const vulns = data.vulns || [];
    const vulnerabilityCount = vulns.length;
    const { score, level } = computeRisk(vulnerabilityCount);

    const vulnerabilities: Vulnerability[] = vulns.map((vuln) => ({
      id: vuln.id,
      summary: vuln.summary || 'No summary available',
      details: vuln.details || 'No details available',
      published: vuln.published || 'Unknown',
      modified: vuln.modified || 'Unknown',
      severity: extractSeverity(vuln),
      references: vuln.references?.map((ref) => ref.url) || [],
    }));

    const result: ScanResult = {
      package: name,
      ecosystem,
      version,
      vulnerabilityCount,
      riskScore: score,
      riskLevel: level,
      vulnerabilities,
      recommendation: getRecommendation(level),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('OSV scan error:', error);
    return NextResponse.json(
      { error: 'Failed to scan package. Please try again.' },
      { status: 500 }
    );
  }
}
