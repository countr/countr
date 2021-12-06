import { ClusterData, ManagerStatus } from "../types/manager";
import { router as clusterRouter, clusters } from "./clusters";
import config from "../config";
import express from "express";
import { expressLogger } from "../utils/logger/express";
import { managerLogger } from "../utils/logger/manager";

const uptime = Date.now();

const app = express();
app.use(expressLogger);
app.use(express.json());

app.use("/cluster", clusterRouter);

app.get("/", (_req, res) => {
  const list: Array<ClusterData> = Array.from(clusters.values());
  res.json({
    clusters: list,
    guilds: list.map(c => c.guilds).reduce((a, b) => a + b, 0),
    users: list.map(c => c.users).reduce((a, b) => a + b, 0),
    uptime,
    update: Date.now(),
  } as ManagerStatus);
});

if (config.apiPort) app.listen(config.apiPort, () => managerLogger.info(`Webserver listening on port ${config.apiPort}.`));
else throw new Error("Manager has no port to listen to.");
