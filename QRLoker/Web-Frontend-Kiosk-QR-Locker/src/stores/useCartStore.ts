import { create } from "zustand";
import { persist } from "zustand/middleware";

type ICartState = {
    cart: IProduct[];
    item_checkout: IProduct[];

    addToCart: (product: IProduct) => void;
    reduceFromCart: (title: string) => void;
    removeFromCart: (title: string) => void;
    removeMultiItemFromCart: (selectedIds: string[]) => void;
    addToCartWithQty: (product: IProduct, quantity: number) => void;
    updateQuantity: (title: string, quantity: number) => void;

    clearCart: () => void;
    directCheckout: (product: IProduct) => void;

    checkout: (selectedIds: string[]) => void;
    createTransaction: (selectedIds: string[]) => void;

    isOutOfStock: (title: string) => boolean;
    getCartItemLength: () => number;
};

export const useCartStore = create<ICartState>()(
    persist((set, get) => ({
        cart: [],
        item_checkout: [],

        addToCart: (item) => {
            set((state) => {
                const existingItem = state.cart.find((i) => i.title === item.title);

                if (existingItem) {
                    if (!item.stock) {
                        return { cart: state.cart.map((i) => i.title === item.title ? { ...i, quantity: i.quantity! + 1 } : i), };
                    }
                    if (existingItem.quantity! < item.stock) {
                        return { cart: state.cart.map((i) => i.title === item.title ? { ...i, quantity: i.quantity! + 1 } : i), };
                    }

                    return state; // Prevent adding more if out of stock
                } else if (item.stock! <= 0) {
                    return {
                        cart: [...state.cart],
                    };
                }

                return {
                    cart: [...state.cart, { ...item, quantity: item.quantity || 1 }],
                };
            });
        },

        reduceFromCart: (title) => {
            set((state) => ({
                cart: state.cart.map((item) => item.title === title ? { ...item, quantity: item.quantity! - 1 } : item).filter((item) => item.quantity! > 0), // Remove if quantity is 0
            }));
        },

        removeFromCart: (title) =>
            set((state) => ({
                cart: state.cart.filter((product) => product.title !== title),
            })),

        removeMultiItemFromCart: (selectedIds) =>
            set((state) => ({
                cart: state.cart.filter((product) => !selectedIds.includes(product.title)),
            })),

        addToCartWithQty: (product, quantity) => {
            set((state) => {
                const existingItem = state.cart.find((i) => i.title === product.title);

                if (existingItem) {
                    return { cart: state.cart.map((i) => i.title === product.title ? { ...i, quantity: i.quantity! + quantity } : i) };
                } else {
                    return {
                        // @ts-ignore
                        cart: [...state.cart, { ...product, quantity: quantity || 1 }],
                    };
                }

            });
        },

        updateQuantity: (title, quantity) =>
            set((state) => ({
                cart: state.cart.map((product) => {
                    if (quantity) {
                        if (product.title === title) {
                            const maxQuantity = product.stock ?? Number.MAX_SAFE_INTEGER; // Default to a high value if `stok` is undefined
                            return { ...product, quantity: Math.min(quantity, maxQuantity) };
                        }
                        return product;
                    }

                    return { ...product, quantity: 1 }
                }),
            })),

        clearCart: () => set({ cart: [], item_checkout: [] }),

        checkout: (selectedIds) =>
            set((state) => ({
                item_checkout: state.cart.filter((product) => selectedIds.includes(product.title)),
            })),

        directCheckout: (product) =>
            set(() => ({
                item_checkout: [product],
            })),

        createTransaction: (selectedIds) =>
            set((state) => ({
                cart: state.cart.filter((product) => !selectedIds.includes(product.title)),
                item_checkout: []
            })),

        isOutOfStock: (title) => {
            const item = get().cart.find((i) => i.title === title);
            return item ? item.quantity! >= item.stock! : false;
        },
        getCartItemLength: () => {
            const item = get().cart.reduce((sum, item) => sum + item.quantity!, 0);
            return item
        }
    }),
        {
            name: "cart-storage", // Local storage key
        }
    )
);
