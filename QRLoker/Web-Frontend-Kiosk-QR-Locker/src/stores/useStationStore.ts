import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface IStation {
    id: number
    code: string
    name: string
    location: string
}

type IStationState = {
    station: IStation | undefined;

    setStation: (station: IStation | undefined) => void;
};

export const useStationStore = create<IStationState>()(
    persist(
        (set, _) => ({
            station: undefined,

            setStation: (station: IStation | undefined) => set({ station: station }),

        }),
        {
            name: "station-storage", // Local storage key
        }
    )
);
