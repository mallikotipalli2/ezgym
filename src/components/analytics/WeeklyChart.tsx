import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { Card } from '@/components/ui/Card';
import type { WeeklyData } from '@/types';

interface WeeklyChartProps {
  data: WeeklyData[];
}

export const WeeklyChart = ({ data }: WeeklyChartProps) => {
  const maxVolume = Math.max(...data.map((d) => d.volume), 1);

  return (
    <Card variant="gradient" padding="md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">This Week</h3>
        <span className="text-xs text-surface-400">Volume (lbs)</span>
      </div>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="20%">
            <XAxis
              dataKey="shortDay"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#71717a', fontSize: 11, fontWeight: 500 }}
            />
            <YAxis hide />
            <Tooltip
              cursor={false}
              contentStyle={{
                backgroundColor: '#27272a',
                border: '1px solid #3f3f46',
                borderRadius: '12px',
                fontSize: '12px',
                color: '#fff',
              }}
              formatter={(value: number) => [`${value.toLocaleString()} lbs`, 'Volume']}
              labelFormatter={(label) => {
                const item = data.find((d) => d.shortDay === label);
                return item?.day || label;
              }}
            />
            <Bar dataKey="volume" radius={[6, 6, 0, 0]} maxBarSize={32}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.workouts > 0 ? '#6366f1' : '#27272a'}
                  opacity={entry.workouts > 0 ? 0.8 + (entry.volume / maxVolume) * 0.2 : 0.4}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between mt-3 pt-3 border-t border-surface-800">
        <div>
          <span className="text-xs text-surface-400">Workouts</span>
          <p className="text-lg font-bold text-white">
            {data.reduce((sum, d) => sum + d.workouts, 0)}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-surface-400">Total Volume</span>
          <p className="text-lg font-bold text-white">
            {data.reduce((sum, d) => sum + d.volume, 0).toLocaleString()}
          </p>
        </div>
      </div>
    </Card>
  );
};
