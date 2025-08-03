import { useState } from 'react'
import { RepoSelector } from '@/components/RepoSelector'
import { CommitChart } from '@/components/CommitChart'
import { ContributorChart } from '@/components/ContributorChart'
import { useCommitActivity, useContributors } from '@/api/github'

export function Dashboard() {
    const [repo, setRepo] = useState('Term-5-CSD-ESC-Ascenda-BNB/web')
    const [owner, name] = repo.split('/')

    const {
        data: commitsByDay,
        isLoading: commitsLoading,
        error: commitsError,
    } = useCommitActivity(owner, name)

    const {
        data: contributors,
        isLoading: contribLoading,
        error: contribError,
    } = useContributors(owner, name)

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">GitHub Commit Activity</h1>

            <RepoSelector onSubmit={setRepo} />

            {commitsLoading ? (
                <p>Loading commits…</p>
            ) : commitsError ? (
                <p>Error loading commits.</p>
            ) : (
                <CommitChart data={commitsByDay!} />
            )}

            {contribLoading ? (
                <p>Loading contributors…</p>
            ) : contribError ? (
                <p>Error loading contributors.</p>
            ) : (
                <ContributorChart contributors={contributors ?? []} loading={contribLoading} />
            )}
        </div>
    )
}
