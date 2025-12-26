import type { TeamInfo } from '@/types/team';
import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';

const SPX_BASE = "https://gfx.dragonstv.io";
const SPX_API = "https://gfx.dragonstv.io/api/v1";

export const saveObjectToSpx = async (folder: string, filename: string, content: Object) => {
    const payload = {
        subfolder: folder,
        filename: filename,
        content: content
    }

    await fetch(`${SPX_API}/saveCustomJSON`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
}


export async function loadObjectFromSpx<T>(folder: string, filename: string): Promise<T> {
    const result = await fetch(`${SPX_BASE}/json/${folder}/${filename}`);
    return await result.json() as T;
}

interface UseSpxObjectOptions<T> {
    autoLoad?: boolean;
    loadInterval?: number;
    defaultValue?: T;
}

interface UseSpxObjectResult<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    save: (content: T) => Promise<void>;
    load: () => Promise<void>;
    refetch: () => Promise<void>;
}

/**
 * React hook for managing SPX JSON objects with automatic loading, saving, and polling capabilities.
 *
 * @template T - The type of the object to load/save
 * @param folder - The subfolder path in the SPX JSON directory
 * @param filename - The JSON filename (e.g., 'data.json')
 * @param options - Configuration options for the hook
 * @param options.autoLoad - Whether to automatically load data on mount (default: true)
 * @param options.loadInterval - Optional polling interval in milliseconds to automatically refresh data
 * @param options.defaultValue - Default value to use if loading from SPX fails. Will be automatically saved to SPX when used.
 *
 * @returns An object containing:
 * - `data`: The loaded object data (null if not loaded, or defaultValue if load failed and defaultValue was provided)
 * - `loading`: Boolean indicating if a load operation is in progress
 * - `error`: Any error that occurred during load/save operations
 * - `save`: Function to save an object to SPX
 * - `load`: Function to manually load/reload data
 * - `refetch`: Alias for load() to manually refresh data
 *
 * @example
 * ```tsx
 * interface TeamData {
 *   name: string;
 *   score: number;
 * }
 *
 * function TeamDisplay() {
 *   const { data, loading, error, save } = useSpxObject<TeamData>(
 *     'teams',
 *     'team1.json',
 *     {
 *       autoLoad: true,
 *       loadInterval: 5000,
 *       defaultValue: { name: 'Team 1', score: 0 }
 *     }
 *   );
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       <h1>{data?.name}</h1>
 *       <p>Score: {data?.score}</p>
 *       <button onClick={() => save({ ...data!, score: data!.score + 1 })}>
 *         Increment Score
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useSpxObject<T>(
    folder: string,
    filename: string,
    options: UseSpxObjectOptions<T> = {}
): UseSpxObjectResult<T> {
    const { autoLoad = true, loadInterval, defaultValue } = options;
    const [data, setData] = useState<T | null>(defaultValue ?? null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await loadObjectFromSpx<T>(folder, filename);
            setData(result);
        } catch (err) {
            console.error('Failed to load data from SPX', err)
            setError(err instanceof Error ? err : new Error('Failed to load object'));
            if (defaultValue !== undefined) {
                setData(defaultValue);
                // Save the default value to SPX so it's available next time
                try {
                    await saveObjectToSpx(folder, filename, defaultValue as Object);
                } catch (saveErr) {
                    // Ignore save errors, we already have the error from loading
                    console.error('Failed to save default value to SPX:', saveErr);
                }
            }
        } finally {
            setLoading(false);
        }
    }, [folder, filename, defaultValue]);

    const save = useCallback(async (content: T) => {
        setError(null);
        try {
            await saveObjectToSpx(folder, filename, content as Object);
            setData(content);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to save object'));
            throw err;
        }
    }, [folder, filename]);

    const refetch = useCallback(async () => {
        await load();
    }, [load]);

    useEffect(() => {
        if (autoLoad) {
            load();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (loadInterval && loadInterval > 0) {
            const interval = setInterval(() => {
                load();
            }, loadInterval);

            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadInterval]);

    return {
        data,
        loading,
        error,
        save,
        load,
        refetch
    };
}

const fetcher = (path: string) => fetch(new URL(path)).then(res => res.json());

export function useTeamData() {
    const { data } = useSWR<TeamInfo[]>(`${SPX_BASE}/static-data/teams.json`, fetcher);
    return data;
}