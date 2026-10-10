import express, { type Request, type Response } from 'express';
import bodyParser from "body-parser";
import cors from 'cors'

import kioskRouter from './routes/kiosk.route';
import transactionRouter from './routes/transaction.route';
import lockerRouter from './routes/locker.route';
import { imageProxyHandler } from './controllers/common.controller';

const { PORT } = process.env;

const app = express();
app.use(express.json());
app.use(bodyParser.json({ limit: "100mb" }))
app.use(bodyParser.urlencoded({ limit: "100mb", extended: false }))
app.use(cors())

app.get("/api", (req, res) => {
    res.status(200).json({
        code: 0, message: "API is running🚀🚀🚀", data: {
            version: "1.0.0",
            name: "Kiosk and QR Locker Service API",
            author: "ichsankurnia"
        }
    });
});

app.use("/api/kiosk", kioskRouter);
app.use("/api/kiosk/transaction", transactionRouter);
app.use("/api/locker", lockerRouter);
app.use("/api/proxy-image", imageProxyHandler);

app.get("/ping", (req, res) => {
    res.status(200).send("Pong!!");
});

/** Not found handler */
app.use((req: Request, res: Response) => {
    res.status(404).json({ code: 404, message: 'URL Not Found', data: null });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});