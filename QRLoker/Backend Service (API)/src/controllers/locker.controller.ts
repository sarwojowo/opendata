import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";
import { db } from "../db/drizzle";
import { locker, logLocker, product, transaction, transactionItem } from "../db/schema";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

export async function getAndVerifyTransaction(req: Request, res: Response) {
    try {
        const code = req.params.code;

        const tx = await db.query.transaction.findFirst({
            where: eq(transaction.pickupCode, code!),
            with: {
                locker: {
                    columns: {
                        id: true,
                        code: true,
                        name: true
                    }
                },
                station: {
                    columns: {
                        id: true,
                        code: true,
                        name: true
                    }
                }
            }
        })

        if (!tx) return res.status(404).json({ message: "Invalid QR code", data: null });

        if (tx.pickupStatus === 'done' || tx.status === 'completed') {
            return res.status(400).json({ message: `This transaction already complete and pickup at ${dayjs(tx.pickupTimeAt).format('dddd, YYYY MMM DD HH:mm:ss')}`, data: null });
        }

        const items = await db
            .select({
                id: transactionItem.id,
                productName: product.name,
                quantity: transactionItem.quantity,
                price: transactionItem.price,
                subtotal: transactionItem.subtotal,
            })
            .from(transactionItem)
            .innerJoin(product, eq(transactionItem.productId, product.id))
            .where(eq(transactionItem.transactionId, tx.id));

        return res.json({
            message: 'success',
            data: {
                transaction: tx, items
            }
        });
    } catch (error: any) {
        return res.status(500).json({ message: error.message, data: null });
    }
}


export async function completeLockerTransaction(req: Request, res: Response) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool);

    try {
        const code = req.params.code;

        const [trx] = await db.select().from(transaction).where(eq(transaction.pickupCode, code!));

        if (!trx) {
            return res.status(404).json({ message: "Transaction not found", data: null });
        }

        if (trx.pickupStatus === 'done') {
            return res.status(400).json({ message: `This transaction already complete and pickup at ${dayjs(trx.pickupTimeAt).format('dddd, YYYY MMM DD HH:mm:ss')}`, data: null });
        }

        if (trx.status !== 'paid') {
            return res.status(400).json({ message: "This transaction has not been paid yet", data: null });
        }

        const result = await db.transaction(async (tx) => {
            // Update transaction status
            await tx.update(transaction)
                .set({
                    status: 'completed',
                    pickupStatus: "done",
                    pickupTimeAt: new Date(),
                })
                .where(eq(transaction.pickupCode, code!));

            // Release the locker status
            await tx.update(locker)
                .set({
                    status: 'available'
                }).where(eq(locker.id, Number(trx.lockerId)))

            await tx.insert(logLocker).values({ lockerId: trx.lockerId, transactionId: trx.id, status: 'successfully opened' })
        })

        return res.json({ message: 'success', data: result });
    } catch (error: any) {
        console.log(error)
        return res.status(500).json({ message: error.message, data: null });
    } finally {
        await pool.end();
    }
}
