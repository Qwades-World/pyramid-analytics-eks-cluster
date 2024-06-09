import { awsInstanceResource, ebsAtt } from "./imdbEC2";
import { eksCluster } from "./eksCluster";
import { eksVpc } from "./networking";
import { rds } from "./rds";

// Export some values for use elsewhere
export const ebsVolume = ebsAtt.id;
export const ec2Instance = awsInstanceResource.id;
export const kubeconfig = eksCluster.kubeconfig;
export const rdsEndpoint = rds.endpoint;
export const rdsPort = rds.port;
export const vpcId = eksVpc.vpcId;
