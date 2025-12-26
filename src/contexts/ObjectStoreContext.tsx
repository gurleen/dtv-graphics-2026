import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useObjectStore } from '@/util/use-object-store';

const ObjectStoreUrl = "wss://live-data.dragonstv.io/ws"

interface ObjectStoreContextValue<T = any> {
    data: Record<string, T>;
    isConnected: boolean;
    subscribe: (key: string) => void;
    unsubscribe: (key: string) => void;
    set: (key: string, value: T) => void;
    get: (key: string) => void;
}

const ObjectStoreContext = createContext<ObjectStoreContextValue | null>(null);

interface ObjectStoreProviderProps {
    children: ReactNode;
    url?: string;
    autoReconnect?: boolean;
    reconnectInterval?: number;
}

export function ObjectStoreProvider({
    children,
    url = ObjectStoreUrl,
    autoReconnect = true,
    reconnectInterval = 3000
}: ObjectStoreProviderProps) {
    const objectStore = useObjectStore(url, {
        autoReconnect,
        reconnectInterval
    });

    return (
        <ObjectStoreContext.Provider value={objectStore}>
            {children}
        </ObjectStoreContext.Provider>
    );
}

export function useObjectStoreContext<T = any>(key: string): [T | undefined, (value: T) => void] {
    const context = useContext(ObjectStoreContext);

    if (!context) {
        throw new Error('useObjectStoreContext must be used within an ObjectStoreProvider');
    }

    const { data, subscribe, unsubscribe, set } = context;

    useEffect(() => {
        subscribe(key);

        return () => {
            unsubscribe(key);
        };
    }, [key, subscribe, unsubscribe]);

    const setValue = (value: T) => {
        set(key, value);
    };

    return [data[key] as T | undefined, setValue];
}
