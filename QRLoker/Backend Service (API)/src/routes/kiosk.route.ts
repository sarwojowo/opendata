import { Router } from "express";
import { getAvailableLocker, getMerchantById, getMerchants, getProductById, getProducts, getRelateProducts, getStations } from "../controllers/kiosk.controller";

const kioskRouter = Router()

kioskRouter.get('/available-locker', getAvailableLocker)
kioskRouter.get('/merchants', getMerchants)
kioskRouter.get('/merchants/:id', getMerchantById)
kioskRouter.get('/products', getProducts)
kioskRouter.get('/products/:id', getProductById)
kioskRouter.get('/relate-products', getRelateProducts)
kioskRouter.get('/stations', getStations)

export default kioskRouter