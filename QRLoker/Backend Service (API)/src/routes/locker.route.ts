import { Router } from "express";

import { completeLockerTransaction, getAndVerifyTransaction } from "../controllers/locker.controller";

const lockerRouter = Router()

lockerRouter.get('/:code', getAndVerifyTransaction)
lockerRouter.get('/:code/complete', completeLockerTransaction)

export default lockerRouter