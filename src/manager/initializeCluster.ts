import config from "../config";
import superagent from "superagent";

export function askForPermissionToInitialize(): Promise<boolean> {
  if (!config.apiUri) return Promise.resolve(true);
  return new Promise(resolve => {
    superagent
      .post(`${config.apiUri}/cluster/${config.cluster.id}/init`)
      .set("Authorization", config.client.token)
      .then(res => res.status === 200 ? resolve(true) : resolve(false))
      .catch(() => resolve(false));
  });
}

export function markClusterAsReady(): void {
  if (!config.apiUri) return;
  return void superagent
    .post(`${config.apiUri}/cluster/${config.cluster.id}/done`)
    .set("Authorization", config.client.token)
    .end();
}
