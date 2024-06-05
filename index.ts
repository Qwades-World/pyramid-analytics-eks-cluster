import { rds } from "./rds";
import { eksVpc } from "./networking";
import { eksCluster } from "./eksCluster";

// Export some values for use elsewhere
export const kubeconfig = eksCluster.kubeconfig;
export const vpcId = eksVpc.vpcId;
export const rdsEndpoint = rds.endpoint;
export const rdsPort = rds.port;
