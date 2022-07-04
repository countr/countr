import config from "../../../config";
import express from "express";
import { getCombinedData } from "./lists";
import helmet from "helmet";
import { managerLogger } from "../../logger/manager";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";

const app = express();
app.set("trust proxy", config.api.numberOfProxies);
app.use(morgan(":remote-addr :method :url :status :res[content-length] - :response-time ms", { stream: { write: message => managerLogger.http(`Received HTTP request: ${message.slice(0, -1)}`) }}));
app.use(helmet(), rateLimit());

app.get("/", (_, res) => res.json(getCombinedData()));

app.listen(config.api.port);
