import { create } from "zustand";
import { persist } from "zustand/middleware";

type IAppConfigState = {
    serviceFee: number;
    isCustomDeductKMT: boolean;
    customDeductAmount: number;

    setServiceFee: (val: number) => void;
    setIsCustomDeductKMT: (val: boolean) => void;
    setCustomDeductAmount: (val: number) => void;
};

export const useAppConfigStore = create<IAppConfigState>()(
    persist(
        (set, _) => ({
            serviceFee: 0,
            isCustomDeductKMT: false,
            customDeductAmount: 1,

            setServiceFee: (val: number) => set({ serviceFee: val }),
            setIsCustomDeductKMT: (val: boolean) => set({ isCustomDeductKMT: val }),
            setCustomDeductAmount: (val: number) => set({ customDeductAmount: val }),
        }),
        {
            name: "appconfig-storage", // Local storage key
        }
    )
);
