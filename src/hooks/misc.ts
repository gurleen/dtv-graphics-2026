import type { GameVideoFeed } from "@/types/misc";
import { useObjectStore } from "@/util/use-object-store";
import { useEffect } from "react";

export function useAroundTheConfStreams() {
    const {
        data,
        subscribe,
        unsubscribe,
        set
    } = useObjectStore<GameVideoFeed[]>();

    useEffect(() => {
        subscribe('around-the-conf');
        return () => unsubscribe('around-the-conf');
    }, []);

    const setSingleStream = (stream: GameVideoFeed) => {
        const currentStreams = data['around-the-conf'] || [];
        const streamIndex = currentStreams.findIndex(s => s.game_id === stream.game_id);
        let updatedStreams: GameVideoFeed[];
        if (streamIndex !== -1) {
            updatedStreams = [...currentStreams];
            updatedStreams[streamIndex] = stream;
        } else {
            updatedStreams = [...currentStreams, stream];
        }
        set('around-the-conf', updatedStreams);
    }

    const streams = data['around-the-conf'];
    return { streams, setSingleStream };
}