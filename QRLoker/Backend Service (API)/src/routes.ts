import { Router } from "express";

import { getAvailableLocker, getMerchantById, getMerchants, getProductById, getProducts, getRelateProducts, getStations } from "./controllers/kiosk.controller";
import { cancelPayment, createTransaction, getTransactionStatus, payTransaction, updateTransactionDuration } from "./controllers/transaction.controller";
import { completeLockerTransaction, getAndVerifyTransaction } from "./controllers/locker.controller";

const router = Router()

router.get('/kiosk/available-locker', getAvailableLocker)
router.get('/kiosk/merchants', getMerchants)
router.get('/kiosk/merchants/:id', getMerchantById)
router.get('/kiosk/products', getProducts)
router.get('/kiosk/products/:id', getProductById)
router.get('/kiosk/relate-products', getRelateProducts)
router.get('/kiosk/stations', getStations)

router.post('/kiosk/transaction', createTransaction)
router.get('/kiosk/transaction/:id/cancel-payment', cancelPayment)
router.get('/kiosk/transaction/:id/duration', updateTransactionDuration)
router.get('/kiosk/transaction/:id/pay', payTransaction)
router.get('/kiosk/transaction/:id/status', getTransactionStatus)

router.get('/locker/:code', getAndVerifyTransaction)
router.get('/locker/:code/complete', completeLockerTransaction)

export default router