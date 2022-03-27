import type { Cluster, ClusterData, ClusterUpdate } from "../utils/cluster";
import { Router as expressRouter, json } from "express";
import type { PresenceData } from "discord.js";
import { addToCount } from "./global";
import config from "../config";

export const router = expressRouter();
export const clusters = new Map<Cluster["id"], ClusterData>();

// require authorization for this route
router.use((req, res, next) => {
  if (req.headers["authorization"] !== config.client.token) return res.sendStatus(401);
  next();
}, json());

router.post("/:clusterId/stats", (req, res) => {
  const request = req.body as ClusterUpdate;
  if (request.type !== "cluster-update") return res.sendStatus(400);

  const { newCounts, ...payload } = request.payload;
  clusters.set(request.payload.cluster.id, payload);
  addToCount(newCounts);
  return res.sendStatus(200);
});

router.get("/:clusterId/status", (_, res) => res.json({
  status: "online",
  activities: [
    {
      type: "WATCHING",
      name: "",
    },
  ],
} as PresenceData));

// avoid clusters initializing at once, instead limit to only one cluster. sequence isn't important, as long as they all initialize within a reasonable time without overlapping.
let clusterInitializing: number | null = null;

router.post("/:clusterId/init", (req, res) => {
  if (clusterInitializing !== null) return res.sendStatus(400);
  clusterInitializing = parseInt(req.params.clusterId);
  res.sendStatus(200);
});

router.post("/:clusterId/done", (_, res) => {
  clusterInitializing = null; // reset so a new cluster can initialize
  res.sendStatus(200);
});
