import { OverlayType } from "@/types/overlayType";
import { create } from "zustand";


interface OverlayState {
    visible: boolean;
    type: OverlayType;
    title?: string;
    subtitle?: string;
    show: (type: OverlayType, data?: { title?: string; subtitle?: string }) => void;
    hide: () => void;
}

export const useOverlayStore = create<OverlayState>((set) => ({
    visible: false,
    type: "success",
    title: "Operación exitosa",
    subtitle: undefined,

    show: (type, data) =>
        set({
            visible: true,
            type,
            title:
                data?.title ??
                (type === "success"
                    ? "Operación exitosa"
                    : type === "error"
                        ? "Ocurrió un error"
                        : type === "warning"
                            ? "Atención"
                            : "Información"),
            subtitle: data?.subtitle,
        }),

    hide: () => set({ visible: false }),
}));