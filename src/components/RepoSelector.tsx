import { useState } from 'react'

type Props = {
    onSubmit: (fullName: string) => void
}

export function RepoSelector({ onSubmit }: Props) {
    const [value, setValue] = useState('Term-5-CSD-ESC-Ascenda-BNB/web')

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                onSubmit(value.trim())
            }}
            className="flex gap-2 mb-4"
        >
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="border px-6 py-2 flex-1 rounded-full"
                placeholder="owner/repo"
            />
            <button type="submit" className="bg-blue-600 text-white px-4 rounded">
                Load
            </button>
        </form>
    )
}
