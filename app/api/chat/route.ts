import { streamText, tool, convertToModelMessages } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: 'openai/gpt-4o-mini',
    system: `You are a security vulnerability expert assistant for VulnScout. You help users understand CVEs, security advisories, and provide remediation guidance.

When discussing vulnerabilities:
- Always reference specific CVE or GHSA IDs when available
- Explain the severity and impact clearly
- Provide actionable remediation steps
- Cite the OSV database as your source

You have access to tools to fetch real vulnerability data. Use them to provide accurate, grounded responses.`,
    messages: await convertToModelMessages(messages),
    tools: {
      get_cves_for_package: tool({
        description: 'Get all known CVEs/vulnerabilities for a specific package. Use this when a user asks about vulnerabilities in a package.',
        inputSchema: z.object({
          packageName: z.string().describe('The name of the package to check'),
          ecosystem: z.string().describe('The package ecosystem (npm, PyPI, Go, Maven, etc.)'),
          version: z.string().optional().describe('Optional specific version to check'),
        }),
        execute: async ({ packageName, ecosystem, version }) => {
          const baseUrl = process.env.VERCEL_URL 
            ? `https://${process.env.VERCEL_URL}` 
            : 'http://localhost:3000';
          
          const response = await fetch(`${baseUrl}/api/mcp/get_cves_for_package`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ packageName, ecosystem, version }),
          });
          
          if (!response.ok) {
            return { error: 'Failed to fetch CVEs' };
          }
          
          return await response.json();
        },
      }),
      
      explain_cve: tool({
        description: 'Get detailed explanation of a specific CVE or GHSA vulnerability. Use this when a user wants to understand what a vulnerability means.',
        inputSchema: z.object({
          cveId: z.string().describe('The CVE or GHSA ID to explain (e.g., CVE-2021-44228 or GHSA-jfh8-c2jp-5v3q)'),
        }),
        execute: async ({ cveId }) => {
          const baseUrl = process.env.VERCEL_URL 
            ? `https://${process.env.VERCEL_URL}` 
            : 'http://localhost:3000';
          
          const response = await fetch(`${baseUrl}/api/mcp/explain_cve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cveId }),
          });
          
          if (!response.ok) {
            return { error: 'Failed to explain CVE' };
          }
          
          return await response.json();
        },
      }),
      
      get_patch_version: tool({
        description: 'Get the recommended patch version to fix vulnerabilities in a package. Use this when a user wants to know how to fix vulnerabilities.',
        inputSchema: z.object({
          packageName: z.string().describe('The name of the package'),
          ecosystem: z.string().describe('The package ecosystem (npm, PyPI, Go, Maven, etc.)'),
          currentVersion: z.string().optional().describe('The current version being used'),
        }),
        execute: async ({ packageName, ecosystem, currentVersion }) => {
          const baseUrl = process.env.VERCEL_URL 
            ? `https://${process.env.VERCEL_URL}` 
            : 'http://localhost:3000';
          
          const response = await fetch(`${baseUrl}/api/mcp/get_patch_version`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ packageName, ecosystem, currentVersion }),
          });
          
          if (!response.ok) {
            return { error: 'Failed to get patch version' };
          }
          
          return await response.json();
        },
      }),
    },
    maxSteps: 5,
  });

  return result.toUIMessageStreamResponse();
}
