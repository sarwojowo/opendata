import { eq, and, ilike, sql, desc, inArray } from "drizzle-orm";
import type { Request, Response } from "express";
import { db } from "../db/drizzle";
import { locker, merchant, merchantStation, product, station } from "../db/schema";


export async function getAvailableLocker(req: Request, res: Response) {
    try {
        const stationId = req.query.stationId

        if (!stationId) return res.status(400).json({ message: 'Station ID is required', data: [] });

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
            .leftJoin(station, eq(station.id, Number(stationId)))
            .where(and(
                eq(locker.stationId, Number(stationId)),
                eq(locker.status, "available")
            ));

        if (availableLockers.length === 0) {
            return res.status(400).json({ message: "No available locker in this station." });
        }

        return res.json({ message: 'Locker available in this station', data: availableLockers });
    } catch (error: any) {
        return res.status(500).json({ message: error?.message, data: null });
    }
}


export async function getMerchants(req: Request, res: Response) {
    try {
        const stationId = req.query.stationId
        const merchantName = req.query.merchant;

        if (!stationId) return res.json({ message: 'success', data: [] });

        const where = [];
        if (stationId) where.push(eq(merchantStation.stationId, Number(stationId)));
        if (merchantName) where.push(ilike(merchant.name, `%${merchantName}%`));

        const result = await db
            .select({
                id: merchantStation.id,
                merchantId: merchantStation.merchantId,
                merchantName: merchant.name,
                merchantImage: merchant.image,
                stationId: merchantStation.stationId,
                stationName: station.name,
            })
            .from(merchantStation)
            .innerJoin(merchant, eq(merchantStation.merchantId, merchant.id))
            .innerJoin(station, eq(merchantStation.stationId, station.id))
            .where(where.length > 0 ? and(...where) : sql`TRUE`);

        return res.json({ message: 'success', data: result });
    } catch (error: any) {
        return res.status(500).json({ message: error?.message, data: null });
    }
}


export async function getMerchantById(req: Request, res: Response) {
    try {
        const id = req.params.id;

        const result = await db.query.merchant.findFirst({
            where: (m, { eq }) => eq(m.id, Number(id)),
        });

        return res.json({ message: 'success', data: result });
    } catch (error: any) {
        return res.status(500).json({ message: error?.message, data: null });
    }
}


export async function getProducts(req: Request, res: Response) {
    try {
        const stationId = req.query.stationId
        const merchantId = req.query.merchantId
        const productName = req.query.product

        if (!stationId) return res.json({ message: 'success', data: [] });

        const where = [];
        if (stationId) where.push(eq(merchantStation.stationId, Number(stationId)));
        if (merchantId) where.push(eq(merchantStation.merchantId, Number(merchantId)));
        if (productName) where.push(ilike(product.name, `%${productName}%`));

        const result = await db
            .select({
                id: product.id,
                title: product.name,
                stock: product.stock,
                disc_price: product.price,
                discount: product.discount,
                price: product.originalPrice,
                thumbnail: product.image,
                merchant: merchant.name,
                merchant_id: merchant.id,
                merchant_image: merchant.image,
                station_name: station.name,
            })
            .from(product)
            .innerJoin(merchantStation, eq(product.merchantStationId, merchantStation.id))
            .innerJoin(merchant, eq(merchantStation.merchantId, merchant.id))
            .innerJoin(station, eq(merchantStation.stationId, station.id))
            .where(where.length > 0 ? and(...where) : sql`TRUE`)
            .orderBy(desc(product.discount))

        return res.json({ message: 'success', data: result });
    } catch (error: any) {
        return res.status(500).json({ message: error?.message, data: null });
    }
}


export async function getProductById(req: Request, res: Response) {
    try {
        const id = req.params.id

        const result = await db
            .select({
                id: product.id,
                title: product.name,
                stock: product.stock,
                disc_price: product.price,
                discount: product.discount,
                price: product.originalPrice,
                thumbnail: product.image,
                merchant: merchant.name,
                merchant_id: merchant.id,
                merchant_image: merchant.image,
                station_name: station.name,
            })
            .from(product)
            .innerJoin(merchantStation, eq(product.merchantStationId, merchantStation.id))
            .innerJoin(merchant, eq(merchantStation.merchantId, merchant.id))
            .innerJoin(station, eq(merchantStation.stationId, station.id))
            .where(eq(product.id, Number(id)))

        const data = result[0] || null
        return res.json({ message: 'success', data });
    } catch (error: any) {
        return res.status(500).json({ message: error?.message, data: null });
    }
}

export async function getRelateProducts(req: Request, res: Response) {
    try {
        const stationId = req.query.stationId
        const merchants = req.query.merchants

        if (!stationId) return res.json({ message: 'success', data: [] });

        const where = [];
        if (stationId) where.push(eq(merchantStation.stationId, Number(stationId)));
        if (merchants) {
            // @ts-ignore
            const merchantIds = merchants.split(",").map((id) => Number(id.trim())).filter((id) => !isNaN(id));
            if (merchantIds.length > 0) {
                where.push(inArray(merchantStation.merchantId, merchantIds));
            }
        }

        const result = await db
            .select({
                id: product.id,
                title: product.name,
                stock: product.stock,
                disc_price: product.price,
                discount: product.discount,
                price: product.originalPrice,
                thumbnail: product.image,
                merchant: merchant.name,
                merchant_id: merchant.id,
                merchant_image: merchant.image,
                station_name: station.name,
            })
            .from(product)
            .innerJoin(merchantStation, eq(product.merchantStationId, merchantStation.id))
            .innerJoin(merchant, eq(merchantStation.merchantId, merchant.id))
            .innerJoin(station, eq(merchantStation.stationId, station.id))
            .where(where.length > 0 ? and(...where) : sql`TRUE`)
            .orderBy(desc(product.discount))

        return res.json({ message: 'success', data: result });
    } catch (error: any) {
        return res.status(500).json({ message: error?.message, data: null });
    }
}


export async function getStations(req: Request, res: Response) {
    try {
        const search = req.query.search

        const whereClauses = [];
        if (search) {
            whereClauses.push(ilike(station.name, `%${search}%`));
        }

        const result = await db
            .select({
                id: station.id,
                code: station.code,
                name: station.name,
                location: station.location,
            })
            .from(station)
            .where(whereClauses.length ? and(...whereClauses) : sql`TRUE`);                                     // the fallback sql\TRUE`` ensures the query works even when there’s no filter.

        return res.json({ message: "success", data: result });
    } catch (error: any) {
        return res.status(500).json({ message: error?.message || "Internal server error", data: null });
    }
}
