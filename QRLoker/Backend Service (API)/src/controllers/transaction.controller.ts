import { Pool } from "@neondatabase/serverless";
import dayjs from "dayjs";
import { eq, and, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { drizzle } from 'drizzle-orm/neon-serverless';
import type { Request, Response } from "express";
import { locker, logLocker, product, station, transaction, transactionItem } from "../db/schema";
import { db } from "../db/drizzle";

// 🧩 Zod schema validation
const createTransactionSchema = z.object({
    stationId: z.number(),
    items: z.array(
        z.object({
            productId: z.number(),
            quantity: z.number().positive("Quantity must be greater than 0"),
        })
    ).min(1, "At least one product is required"),
    paymentMethod: z.enum(['QRIS', 'KMT'])
});

export async function createTransaction(req: Request, res: Response) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool);

    try {
        const body = await req.body();
        const parsed = createTransactionSchema.safeParse(body);

        if (!parsed.success) {
            return res.status(400).json({ message: parsed.error.message });
        }

        const { stationId, items, paymentMethod } = parsed.data;


        // 1️⃣ Check available locker in station
        const availableLockers = await db
            .select({
                id: locker.id,
                code: locker.code,
                name: locker.name,
                status: locker.status,
                stationCode: station.code,
            })
            .from(locker)
            .leftJoin(station, eq(station.id, stationId))
            .where(and(
                eq(locker.stationId, stationId),
                eq(locker.status, "available")
            ));

        if (availableLockers.length === 0) {
            return res.status(400).json({ message: "No available locker in this station." });
        }

        // Randomly select one available locker
        const selectedLocker = availableLockers[Math.floor(Math.random() * availableLockers.length)];

        // 2️⃣ Check product stock availability
        const productIds = items.map((i) => i.productId);
        const productsData = await db
            .select()
            .from(product)
            .where(inArray(product.id, productIds));

        // Verify stock for each item
        for (const item of items) {
            const prod = productsData.find((p) => p.id === item.productId);
            if (!prod) {
                return res.status(404).json({ message: `Product with ID ${item.productId} not found.` });
            }
            if (prod.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for product "${prod.name}". Only ${prod.stock} left.` });
            }
        }

        // 3️⃣ Start transaction
        const result = await db.transaction(async (tx) => {
            // const pickupCode = crypto.randomBytes(4).toString("hex").toUpperCase();
            const stationCode = selectedLocker?.stationCode!.padEnd(3, 'X')
            const lockerId = selectedLocker?.id.toString().padStart(3, '0')
            const timeStamp = dayjs().format('YYMMDDHHmmss')
            const pickupCode = stationCode! + lockerId + timeStamp

            // Set payment timeout (5 minutes after creation)
            const paymentTimeoutAt = dayjs().add(5, 'minute').toDate();

            // Create transaction
            const [created] = await tx
                .insert(transaction)
                .values({
                    lockerId: selectedLocker?.id,
                    pickupCode,
                    totalAmount: "0",
                    paymentMethod,
                    stationId,
                    paymentTimeoutAt
                })
                .returning();

            let totalAmount = 0;

            // Insert items & update product stock
            for (const item of items) {
                const prod = productsData.find((p) => p.id === item.productId)!;
                const subtotal = Number(prod.price) * item.quantity;
                totalAmount += subtotal;

                // Insert transaction item
                await tx.insert(transactionItem).values({
                    transactionId: created?.id!,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: prod.price,
                    subtotal: subtotal.toFixed(2),
                });

                // Decrease stock
                await tx
                    .update(product)
                    .set({ stock: prod.stock - item.quantity })
                    .where(eq(product.id, item.productId));
            }

            // Update total amount
            await tx
                .update(transaction)
                .set({ totalAmount: totalAmount.toFixed(2) })
                .where(eq(transaction.id, created?.id!));

            // // Mark locker as occupied
            // await tx
            //     .update(locker)
            //     .set({ status: "occupied" })
            //     .where(eq(locker.id, selectedLocker.id));

            return { data: { id: created?.id, pickupCode, totalAmount, paymentMethod, locker: selectedLocker, paymentTimeoutAt } };
        });

        return res.json({
            message: "Transaction created successfully",
            ...result,
        });
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({ message: error.message, data: null });
    } finally {
        await pool.end()
    }
}


export async function cancelPayment(req: Request, res: Response) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool);

    try {
        const id = req.params.id

        const [trx] = await db.select().from(transaction).where(eq(transaction.pickupCode, id!));

        if (!trx) {
            return res.status(404).json({ message: "Transaction not found", data: null });
        }

        if (trx.status === 'paid' || trx.status === 'completed') {
            return res.status(400).json({ message: `Transaction already paid at ${dayjs(trx.paymentTimeAt).format('YYYY-MM-DD HH:mm:ss')}`, data: null });
        }

        if (trx.status === 'cancelled') {
            return res.status(400).json({ message: `Transaction already cancelled`, data: null });
        }


        // 🕒 Validate timeout
        if (dayjs().isAfter(dayjs(trx.paymentTimeoutAt))) {

            return res.status(400).json({ message: "Payment time expired. Transaction has been cancelled.", data: null });
        }

        await db.transaction(async (tx) => {
            // // 1️⃣ Get all products involved in this transaction
            const products = await tx.select().from(transactionItem).where(eq(transactionItem.transactionId, trx.id))

            // 2️⃣ Loop through each product and return stock
            for (const p of products) {
                await tx.update(product)
                    .set({ stock: sql`${product.stock} + ${p.quantity}` })
                    .where(eq(product.id, p.productId));
            }

            await tx.update(transaction)
                .set({
                    status: 'cancelled',
                    pickupStatus: null
                })
                .where(eq(transaction.id, trx.id));

            await tx.update(locker)
                .set({ status: 'available' })
                .where(eq(locker.id, Number(trx.lockerId)));
        });

        return res.json({ message: 'Payment cancel successfully' });
    } catch (error: any) {
        return res.status(500).json({ message: error?.message, data: null });
    } finally {
        await pool.end();
    }
}


export async function updateTransactionDuration(req: Request, res: Response) {
    try {
        const id = req.params.id

        const [tx] = await db.select().from(transaction).where(eq(transaction.pickupCode, id!));

        if (!tx) return res.status(404).json({ message: "Transaction not found" });

        const now = dayjs();
        const created = dayjs(tx.transactionTimeAt);
        const duration = now.diff(created, 'second');

        await db.update(transaction).set({ transactionDuration: duration }).where(eq(transaction.pickupCode, id!))

        return res.json({ message: 'success', data: { status: tx.status, pickupCode: tx.pickupCode } });
    } catch (error: any) {
        return res.status(500).json({ message: error?.message, data: null });
    }
}


export async function payTransaction(req: Request, res: Response) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool);

    try {
        const id = req.params.id

        const [trx] = await db.select().from(transaction).where(eq(transaction.pickupCode, id!));

        if (!trx) {
            return res.status(404).json({ message: "Transaction not found", data: null });
        }

        if (trx.status === 'paid' || trx.status === 'completed') {
            return res.status(400).json({ message: `Transaction already paid at ${dayjs(trx.paymentTimeAt).format('YYYY-MM-DD HH:mm:ss')}`, data: null });
        }

        if (trx.status === 'cancelled') {
            return res.status(400).json({ message: `Transaction already cancelled`, data: null });
        }

        // 🕒 Validate timeout
        if (dayjs().isAfter(dayjs(trx.paymentTimeoutAt))) {
            await db.transaction(async (tx) => {
                // // 1️⃣ Get all products involved in this transaction
                const products = await tx.select().from(transactionItem).where(eq(transactionItem.transactionId, trx.id))

                // 2️⃣ Loop through each product and return stock
                for (const p of products) {
                    await tx.update(product)
                        .set({ stock: sql`${product.stock} + ${p.quantity}` })
                        .where(eq(product.id, p.productId));
                }

                await tx.update(transaction)
                    .set({
                        status: 'cancelled',
                        pickupStatus: null
                    })
                    .where(eq(transaction.id, trx.id));

                await tx.update(locker)
                    .set({ status: 'available' })
                    .where(eq(locker.id, Number(trx.lockerId)));
            });

            return res.status(400).json({ message: "Payment time expired. Transaction has been cancelled.", data: null });
        }

        const result = await db.transaction(async (tx) => {
            // Update transaction status
            await tx.update(transaction)
                .set({
                    status: "paid",
                    pickupStatus: "ready",
                    paymentTimeAt: new Date(),
                })
                .where(eq(transaction.pickupCode, id!));

            // Update the locker status
            await tx.update(locker)
                .set({ status: 'occupied' })
                .where(eq(locker.id, Number(trx.lockerId)))

            await tx.insert(logLocker).values({ lockerId: trx.lockerId, transactionId: trx.id, status: 'ready for pickup' })
        })

        return res.json({ message: 'Payment successfully', data: result });
    } catch (error: any) {
        return res.status(500).json({ message: error?.message, data: null });
    } finally {
        await pool.end();
    }
}


export async function getTransactionStatus(req: Request, res: Response) {
    try {
        const id = req.params.id

        const [tx] = await db.select().from(transaction).where(eq(transaction.pickupCode, id!));

        if (!tx) return res.status(404).json({ message: "Transaction not found" });

        return res.json({
            message: 'success',
            data: { status: tx.status, pickupCode: tx.pickupCode }
        });
    } catch (error: any) {
        return res.status(500).json({ message: error?.message, data: null });
    }
}
