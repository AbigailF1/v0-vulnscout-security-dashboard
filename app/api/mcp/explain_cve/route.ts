export const runtime = 'edge';

import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cveId } = body;

    if (!cveId) {
      return Response.json(
        { error: 'Missing required field: cveId' },
        { status: 400 }
      );
    }

    // Fetch vulnerability details from OSV
    const osvResponse = await fetch(`https://api.osv.dev/v1/vulns/${cveId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!osvResponse.ok) {
      if (osvResponse.status === 404) {
        return Response.json(
          { error: `Vulnerability ${cveId} not found` },
          { status: 404 }
        );
      }
      throw new Error(`OSV API error: ${osvResponse.status}`);
    }

    const vuln = await osvResponse.json();

    // Extract meaningful explanation
    const aliases = vuln.aliases || [];
    const cve = aliases.find((a: string) => a.startsWith('CVE-'));
    const ghsa = vuln.id.startsWith('GHSA-') ? vuln.id : aliases.find((a: string) => a.startsWith('GHSA-'));

    // Get severity
    let severity = 'UNKNOWN';
    let cvssScore: number | null = null;
    if (vuln.severity && vuln.severity.length > 0) {
      const cvss = vuln.severity.find((s: { type: string; score: string }) => s.type === 'CVSS_V3' || s.type === 'CVSS_V2');
      if (cvss) {
        const score = parseFloat(cvss.score);
        if (!isNaN(score)) {
          cvssScore = score;
          if (score >= 9.0) severity = 'CRITICAL';
          else if (score >= 7.0) severity = 'HIGH';
          else if (score >= 4.0) severity = 'MEDIUM';
          else if (score > 0) severity = 'LOW';
        }
      }
    }

    // Get affected packages
    const affectedPackages = (vuln.affected || []).map((a: { package: { name: string; ecosystem: string } }) => ({
      name: a.package.name,
      ecosystem: a.package.ecosystem,
    }));

    // Get fix information
    const fixes: string[] = [];
    for (const affected of vuln.affected || []) {
      if (affected.ranges) {
        for (const range of affected.ranges) {
          for (const event of range.events || []) {
            if (event.fixed) {
              fixes.push(`${affected.package.name}: upgrade to ${event.fixed}`);
            }
          }
        }
      }
    }

    // Get references
    const references = (vuln.references || []).slice(0, 5).map((ref: { type: string; url: string }) => ({
      type: ref.type,
      url: ref.url,
    }));

    // Determine attack type from CWE or summary
    let attackType = 'Unknown';
    const summary = (vuln.summary || '').toLowerCase();
    const details = (vuln.details || '').toLowerCase();
    const text = summary + ' ' + details;

    if (text.includes('cross-site scripting') || text.includes('xss')) {
      attackType = 'Cross-Site Scripting (XSS)';
    } else if (text.includes('sql injection')) {
      attackType = 'SQL Injection';
    } else if (text.includes('remote code execution') || text.includes('rce')) {
      attackType = 'Remote Code Execution (RCE)';
    } else if (text.includes('denial of service') || text.includes('dos')) {
      attackType = 'Denial of Service (DoS)';
    } else if (text.includes('prototype pollution')) {
      attackType = 'Prototype Pollution';
    } else if (text.includes('path traversal') || text.includes('directory traversal')) {
      attackType = 'Path Traversal';
    } else if (text.includes('authentication bypass')) {
      attackType = 'Authentication Bypass';
    } else if (text.includes('privilege escalation')) {
      attackType = 'Privilege Escalation';
    } else if (text.includes('information disclosure') || text.includes('data leak')) {
      attackType = 'Information Disclosure';
    }

    return Response.json({
      id: vuln.id,
      cveId: cve || null,
      ghsaId: ghsa || null,
      summary: vuln.summary || 'No summary available',
      details: vuln.details || 'No detailed description available',
      severity,
      cvssScore,
      attackType,
      affectedPackages,
      fixes: fixes.length > 0 ? fixes : ['No automatic fix available. Manual review recommended.'],
      references,
      published: vuln.published || null,
      modified: vuln.modified || null,
    });
  } catch (error) {
    console.error('MCP explain_cve error:', error);
    return Response.json(
      { error: 'Failed to explain CVE' },
      { status: 500 }
    );
  }
}
