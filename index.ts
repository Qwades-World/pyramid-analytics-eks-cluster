import {
    awsIMDBInstance,
    awsGCADInstance,
    awsGCGROUPInstance,
    awsGCDEALERInstance,
    ebsAtt
} from "./imdbEC2";
import {
    eksCluster
} from "./eksCluster";
import {
    eksVpc
} from "./networking";
import {
    rds
} from "./rds";

// Export some values for use elsewhere
export const ec2GCADInstance = awsGCADInstance.passwordData;
export const ec2GCDEALERInstance = awsGCDEALERInstance.passwordData;
export const ec2GCGROUPInstance = awsGCGROUPInstance.passwordData;
export const ec2IMDBInstance = awsIMDBInstance.id;
export const kubeconfig = eksCluster.kubeconfig;
export const rdsEndpoint = rds.endpoint;
export const rdsPort = rds.port;
export const vpcId = eksVpc.vpcId;
