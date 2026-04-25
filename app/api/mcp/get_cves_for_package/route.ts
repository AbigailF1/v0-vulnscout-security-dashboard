export const runtime = 'edge';

import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { packageName, ecosystem, version } = body;

    if (!packageName || !ecosystem) {
      return Response.json(
        { error: 'Missing required fields: packageName, ecosystem' },
        { status: 400 }
      );
    }

    // Query OSV API
    const osvQuery: Record<string, unknown> = {
      package: {
        name: packageName,
        ecosystem,
      },
    };

    if (version) {
      osvQuery.version = version;
    }

    const osvResponse = await fetch('https://api.osv.dev/v1/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(osvQuery),
    });

    if (!osvResponse.ok) {
      throw new Error(`OSV API error: ${osvResponse.status}`);
    }

    const data = await osvResponse.json();
    const vulns = data.vulns || [];

    // Extract CVE/GHSA IDs and summaries
    const cves = vulns.map((vuln: { id: string; summary?: string; aliases?: string[]; severity?: Array<{ type: string; score: string }> }) => {
      const aliases = vuln.aliases || [];
      const cveId = aliases.find((a: string) => a.startsWith('CVE-'));
      const ghsaId = vuln.id.startsWith('GHSA-') ? vuln.id : aliases.find((a: string) => a.startsWith('GHSA-'));
      
      let severity = 'UNKNOWN';
      if (vuln.severity && vuln.severity.length > 0) {
        const cvss = vuln.severity.find(s => s.type === 'CVSS_V3' || s.type === 'CVSS_V2');
        if (cvss) {
          const score = parseFloat(cvss.score);
          if (!isNaN(score)) {
            if (score >= 9.0) severity = 'CRITICAL';
            else if (score >= 7.0) severity = 'HIGH';
            else if (score >= 4.0) severity = 'MEDIUM';
            else if (score > 0) severity = 'LOW';
          }
        }
      }

      return {
        id: vuln.id,
        cveId: cveId || null,
        ghsaId: ghsaId || null,
        summary: vuln.summary || 'No summary available',
        severity,
      };
    });

    return Response.json({
      packageName,
      ecosystem,
      version: version || 'all',
      totalVulnerabilities: cves.length,
      cves,
    });
  } catch (error) {
    console.error('MCP get_cves error:', error);
    return Response.json(
      { error: 'Failed to fetch CVEs' },
      { status: 500 }
    );
  }
}
