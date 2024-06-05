import { rds } from "./rds";
import { eksVpc } from "./networking";
import { eksCluster } from "./eksCluster";
import { awsInstanceResource } from "./imdbEC2";

// Export some values for use elsewhere
export const kubeconfig = eksCluster.kubeconfig;
export const vpcId = eksVpc.vpcId;
export const rdsEndpoint = rds.endpoint;
export const rdsPort = rds.port;
export const ec2Instance = awsInstanceResource.id;
