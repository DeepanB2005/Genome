import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ResultsCharts({ results }) {
  const data = [
    { name: "Mutation", value: results.mutationRatio },
    { name: "Transmission", value: results.transmissionRatio },
    { name: "Drug Resistance", value: results.drugResistanceRatio },
  ];
  const COLORS = ["#ef4444", "#22c55e", "#8b5cf6"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div className="h-64">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="h-64">
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
