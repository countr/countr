import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import config from "../../../config";
import managerLogger from "../../logger/manager";
import { getCombinedData } from "./lists";

const app = express();
app.set("trust proxy", config.api.numberOfProxies);
app.use(morgan(":remote-addr :method :url :status :res[content-length] - :response-time ms", { stream: { write: message => managerLogger.http(`Received HTTP request: ${message.slice(0, -1)}`) } }));
app.use(helmet(), rateLimit());

app.get("/", (_, res) => void res.json(getCombinedData()));

app.listen(config.api.port);
