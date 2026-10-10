import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ITransaction = {
    id: number
    pickupCode: string
    totalAmount: number
    paymentMethod: 'QRIS' | 'KMT'
    locker: {
        "id": number
        "code": string
        "name": string
        "status": number
        "stationCode": string
    }
    paymentTimeoutAt: string
}

type ITransactionState = {
    transaction: ITransaction | undefined;

    setTransaction: (station: ITransaction) => void;
};

export const useTransactionStore = create<ITransactionState>()(
    persist(
        (set, _) => ({
            transaction: undefined,

            setTransaction: (data: ITransaction) => set({ transaction: data }),

        }),
        {
            name: "trx-storage", // Local storage key
        }
    )
);
