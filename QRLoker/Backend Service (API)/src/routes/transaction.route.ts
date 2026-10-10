import { Router } from "express";
import { cancelPayment, createTransaction, getTransactionStatus, payTransaction, updateTransactionDuration } from "../controllers/transaction.controller";

const transactionRouter = Router()

transactionRouter.post('/', createTransaction)
transactionRouter.get('/:id/cancel-payment', cancelPayment)
transactionRouter.get('/:id/duration', updateTransactionDuration)
transactionRouter.get('/:id/pay', payTransaction)
transactionRouter.get('/:id/status', getTransactionStatus)

export default transactionRouter