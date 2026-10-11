import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { sampleRisk } from '../data/sample';

const chartData = sampleRisk.map((point) => ({ ...point, band: point.high - point.low }));

export default function RiskChart() {
  return <div className="chart-block">
    <div className="chart-wrap" role="img" aria-label="Illustrative, uncalibrated disease-risk curve. Values are sample design data only, not a field forecast.">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 11, right: 8, left: -17, bottom: 0 }}>
          <CartesianGrid stroke="#edf1ea" vertical={false} strokeDasharray="3 5" />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#89968d', fontSize: 8 }} dy={9} />
          <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} axisLine={false} tickLine={false} tick={{ fill: '#9aa59b', fontSize: 8 }} tickFormatter={(value: number) => `${value}%`} />
          <Tooltip
            cursor={{ stroke: '#cbd9c8', strokeDasharray: '4 4' }}
            contentStyle={{ border: '1px solid #e1e9df', borderRadius: 10, background: '#fffefa', fontSize: 9, boxShadow: '0 8px 24px rgba(30,58,40,.1)' }}
            formatter={(value: number, name: string) => [`${value}%`, name === 'risk' ? 'Illustrative score' : 'Uncertainty band']}
            labelStyle={{ color: '#4a5f4d', fontWeight: 700, marginBottom: 3 }}
          />
          <Area dataKey="low" stackId="uncertainty" stroke="none" fill="#fffefa" fillOpacity={0} isAnimationActive={false} />
          <Area dataKey="band" stackId="uncertainty" stroke="none" fill="#e8f0e4" fillOpacity={.88} isAnimationActive={false} />
          <Line type="monotone" dataKey="risk" stroke="#6f9c66" strokeWidth={2.5} dot={{ r: 3.5, fill: '#fffefa', stroke: '#6f9c66', strokeWidth: 2 }} activeDot={{ r: 5, fill: '#6f9c66', stroke: '#fffefa', strokeWidth: 2 }} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
    <div className="chart-legend"><span><i className="legend-line" /> Illustrative score</span><span><i className="legend-band" /> Example uncertainty range</span><span>0–100 scale · not a probability</span></div>
  </div>;
}
