import { ClusterStatus, ClusterUpdate } from "../types/cluster";
import { ManagerStatus } from "../types/manager";
import config from "../config";
import express from "express";

const app = express();
app.use(express.json());

const clusters = new Map<number, ClusterStatus>();

app.post("/", (req, res) => {
  if (req.headers["authorization"] !== config.client.token) return res.sendStatus(401);

  const request = req.body as ClusterUpdate;
  if (request.type !== "cluster-update") return res.sendStatus(400);

  clusters.set(request.payload.id, request.payload);
  return res.sendStatus(200);
});

app.get("/", (_req, res) => {
  const list: Array<ClusterStatus> = Array.from(clusters.values());
  res.json({
    clusters: list,
    guilds: list.map(c => c.guilds).reduce((a, b) => a + b, 0),
    users: list.map(c => c.users).reduce((a, b) => a + b, 0),
  } as ManagerStatus);
});

/*
 * avoid clusters all initializing at once to Discord. start one by one.
 * sequence is not important, as long as they're all started within a reasonable time without overlapping on each other.
 */
let clusterInitializing: number | null;
app.post("/cluster/:clusterId/init", (req, res) => {
  if (req.headers["authorization"] !== config.client.token) return res.sendStatus(401);

  if (clusterInitializing !== null) return res.sendStatus(400);
  clusterInitializing = parseInt(req.params.clusterId);
  res.sendStatus(200);
});
app.post("/cluster/:clusterId/done", (req, res) => {
  if (req.headers["authorization"] !== config.client.token) return res.sendStatus(401);

  clusterInitializing = null; // reset so a new cluster can initialize
  res.sendStatus(200);
});

if (config.webPort) app.listen(config.webPort, () => console.log(`Webserver listening on port ${config.webPort}.`));
else throw new Error("Manager has no port to listen to.");
