import axios from 'axios'
import { useQuery, keepPreviousData } from '@tanstack/react-query'

// Create an Axios instance with GitHub base URL and optional auth
const token = import.meta.env.VITE_GITHUB_TOKEN
const githubApi = axios.create({
    baseURL: 'https://api.github.com/repos',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
})

// --- Types ---

export interface WeeklyActivity {
    week: number // Unix timestamp (seconds) for start of week
    total: number // total commits in that week
    days: number[] // commits each day, starting on Sunday
}

export interface DayCount {
    date: string // ISO date string "YYYY-MM-DD"
    count: number // commits in that period
}

export interface Contributor {
    login: string
    avatar_url: string
    contributions: number
}

// --- Data Fetchers ---
/**
 * Fetch aggregated weekly commit activity (last 52 weeks)
 * Uses GitHub's stats endpoint, may return 202 while computing
 */
async function fetchWeeklyActivity(
    owner: string,
    repo: string,
    retries = 3,
    delay = 2000
): Promise<WeeklyActivity[]> {
    const url = `/${owner}/${repo}/stats/commit_activity`
    for (let i = 0; i < retries; i++) {
        const res = await githubApi.get<WeeklyActivity[]>(url)
        if (res.status === 200 && Array.isArray(res.data)) {
            return res.data
        }
        // 202 Accepted: stats computing
        await new Promise((r) => setTimeout(r, delay))
    }
    throw new Error('GitHub stats endpoint still processing')
}

/**
 * Convert weekly activity to daily chart points for last 90 days
 */
export function weeklyToDailyChart(data: WeeklyActivity[]): DayCount[] {
    const dailyPoints: DayCount[] = []
    const now = new Date()
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

    // Convert each week's daily data to individual chart points
    data.forEach((week) => {
        const weekStartDate = new Date(week.week * 1000) // Convert Unix timestamp to Date

        // Process each day in the week (Sunday = 0, Monday = 1, etc.)
        week.days.forEach((dayCommits, dayIndex) => {
            const dayDate = new Date(weekStartDate)
            dayDate.setDate(weekStartDate.getDate() + dayIndex)

            // Only include days within the last 90 days
            if (dayDate >= ninetyDaysAgo && dayDate <= now) {
                dailyPoints.push({
                    date: dayDate.toISOString().slice(0, 10), // Format as YYYY-MM-DD
                    count: dayCommits,
                })
            }
        })
    })

    // Sort by date to ensure proper chronological order
    return dailyPoints.sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Fetch list of contributors for owner/repo
 */
export async function fetchContributors(owner: string, repo: string): Promise<Contributor[]> {
    const res = await githubApi.get<Contributor[]>(`/${owner}/${repo}/contributors`, {
        params: { per_page: 100 },
    })
    return res.data
}

// --- React Query Hooks ---
/**
 * Hook to fetch and transform weekly commit activity to daily data (last 90 days)
 */
export function useCommitActivity(owner: string, repo: string) {
    return useQuery({
        queryKey: ['stats', owner, repo],
        queryFn: () => fetchWeeklyActivity(owner, repo).then(weeklyToDailyChart),
        placeholderData: keepPreviousData,
    })
}

/**
 * Hook to fetch contributor data
 */
export function useContributors(owner: string, repo: string) {
    return useQuery({
        queryKey: ['contributors', owner, repo],
        queryFn: () => fetchContributors(owner, repo),
        placeholderData: keepPreviousData,
    })
}
