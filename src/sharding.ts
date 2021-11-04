import { getClusterManager } from "./utils/cluster";

const manager = getClusterManager();

manager.on("clusterCreate", cluster => {
  cluster.on("message", message => {
    if (message === "respawn") {
      console.log(`Manager: Cluster ${cluster.id} has requested a respawn.`);
      cluster.respawn();
    }
  });
  console.log(`Manager: Cluster ${cluster.id} has been created and is starting.`);
});

// todo: api stuff

manager.spawn(undefined, undefined, -1);
