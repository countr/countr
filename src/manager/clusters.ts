import { Cluster, ClusterUpdate } from "../types/cluster";
import { ClusterData } from "../types/manager";
import { PresenceData } from "discord.js";
import config from "../config";
import { Router as expressRouter } from "express";

export const router = expressRouter();
export const clusters = new Map<Cluster["id"], ClusterData>();

router.use((req, res, next) => {
  if (req.headers["authorization"] !== config.client.token) return res.sendStatus(401);
  next();
});

router.post("/:clusterId/stats", (req, res) => {
  const request = req.body as ClusterUpdate;
  if (request.type !== "cluster-update") return res.sendStatus(400);

  clusters.set(request.payload.cluster.id, request.payload);
  return res.sendStatus(200);
});

router.get("/:clusterId/status", (req, res) => res.json({
  status: "online",
  activities: [
    {
      type: "WATCHING",
      name: "",
    },
  ],
} as PresenceData));

/*
 * avoid clusters all initializing at once to Discord. start one by one.
 * sequence is not important, as long as they're all started within a reasonable time without overlapping on each other.
 */
let clusterInitializing: number | null = null;

router.post("/:clusterId/init", (req, res) => {
  if (clusterInitializing !== null) return res.sendStatus(400);
  clusterInitializing = parseInt(req.params.clusterId);
  res.sendStatus(200);
});

router.post("/:clusterId/done", (req, res) => {
  clusterInitializing = null; // reset so a new cluster can initialize
  res.sendStatus(200);
});
