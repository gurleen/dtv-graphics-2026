import React, { useContext } from "react";
import { createContext } from "react";

export function createContextFrom<T>(factory: () => T | null) {
    const Context = createContext<T | null>(null);

    const Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        const value = factory();

        if(value === null) {
            return (<></>);
        }

        return <Context.Provider value={value}>{children}</Context.Provider>;
    };

    function useCustomContext(): T {
        const context = useContext(Context);
        if (!context) {
            throw new Error('useCustomContext must be used within its Provider');
        }
        return context;
    }

    return { Provider, useCustomContext };
}