// utils/useRefreshControl.ts
import { useRef, useState } from "react";

export function useRefreshControl(cooldownSeconds: number = 30) {
    const [refreshing, setRefreshing] = useState(false);
    const [canRefresh, setCanRefresh] = useState(true);
    const [cooldown, setCooldown] = useState(0);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    function startCooldown() {
        setCooldown(cooldownSeconds);

        function tick() {
            setCooldown((prev) => {
                if (prev <= 1) {
                    if (timeoutRef.current) {
                        clearTimeout(timeoutRef.current);
                        timeoutRef.current = null;
                    }
                    return 0;
                }
                timeoutRef.current = setTimeout(tick, 1000);
                return prev - 1;
            });
        }

        timeoutRef.current = setTimeout(tick, 1000);
    }

        //this function destroy the timeout qhen the user leave the scxreen. 
    function cleanup() {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }

    function wrapRefresh<T>(
        refreshFn: () => Promise<T>,
        onError?: (error: unknown) => void
    ) {
        if (!canRefresh) return;

        setRefreshing(true);
        setCanRefresh(false);
        startCooldown();

        return refreshFn()
            .catch((error) => {
                if (onError) onError(error);
            })
            .finally(() => {
                timeoutRef.current = setTimeout(() => {
                    setRefreshing(false);
                    setCanRefresh(true);
                }, cooldownSeconds * 1000);
            });
    }

    return {
        refreshing,
        canRefresh,
        cooldown,
        wrapRefresh,
        cleanup,
    };
}