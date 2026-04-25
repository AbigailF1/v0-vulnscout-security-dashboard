'use client';

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface CVSSChartProps {
  data: Array<{ range: string; count: number }>;
}

// Compute colors in JavaScript (CSS variables don't work in Recharts)
const COLORS = {
  '9.0-10.0': '#ef4444', // red-500 (critical)
  '7.0-8.9': '#f97316',  // orange-500 (high)
  '4.0-6.9': '#eab308',  // yellow-500 (medium)
  '0.1-3.9': '#22c55e',  // green-500 (low)
  'Unknown': '#6b7280',  // gray-500
};

export function CVSSChart({ data }: CVSSChartProps) {
  const hasData = data.some(d => d.count > 0);
  
  if (!hasData) {
    return (
      <div className="h-[200px] flex items-center justify-center text-muted-foreground">
        No vulnerability data to display
      </div>
    );
  }

  return (
    <ChartContainer
      config={{
        count: {
          label: 'Count',
          color: 'hsl(var(--chart-1))',
        },
      }}
      className="h-[200px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
        >
          <XAxis type="number" allowDecimals={false} />
          <YAxis 
            type="category" 
            dataKey="range" 
            tick={{ fontSize: 12 }}
            width={70}
          />
          <ChartTooltip 
            content={<ChartTooltipContent />}
            cursor={{ fill: 'rgba(255,255,255,0.1)' }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.range as keyof typeof COLORS] || '#6b7280'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

// Severity distribution pie chart
import { PieChart, Pie, Tooltip } from 'recharts';

interface SeverityDistribution {
  critical: number;
  high: number;
  medium: number;
  low: number;
  unknown: number;
}

interface SeverityChartProps {
  data: SeverityDistribution;
}

const SEVERITY_COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
  unknown: '#6b7280',
};

export function SeverityChart({ data }: SeverityChartProps) {
  const chartData = [
    { name: 'Critical', value: data.critical, color: SEVERITY_COLORS.critical },
    { name: 'High', value: data.high, color: SEVERITY_COLORS.high },
    { name: 'Medium', value: data.medium, color: SEVERITY_COLORS.medium },
    { name: 'Low', value: data.low, color: SEVERITY_COLORS.low },
    { name: 'Unknown', value: data.unknown, color: SEVERITY_COLORS.unknown },
  ].filter(d => d.value > 0);

  if (chartData.length === 0) {
    return (
      <div className="h-[180px] flex items-center justify-center text-muted-foreground">
        No vulnerabilities found
      </div>
    );
  }

  return (
    <ChartContainer
      config={{
        value: {
          label: 'Count',
        },
      }}
      className="h-[180px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            label={({ name, value }) => `${name}: ${value}`}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number, name: string) => [`${value} vulnerabilities`, name]}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
