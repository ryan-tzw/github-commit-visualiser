import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { type Contributor } from '@/api/github'

type Props = { contributors: Contributor[]; loading: boolean }

export function ContributorChart({ contributors, loading }: Props) {
    if (loading) return <p>Loading contributors…</p>
    if (!contributors.length) return <p>No contributors data found.</p>

    return (
        <div className="w-full h-80 mt-8">
            <h2 className="text-xl font-semibold mb-2">Contributions by Author</h2>
            <ResponsiveContainer>
                <BarChart data={contributors}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="login"
                        tick={{ fontSize: 12 }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                        formatter={(value: number) => [`${value}`, 'Commits']}
                        labelFormatter={(label) => `@${label}`}
                    />
                    <Bar dataKey="contributions" fill="#10B981" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
