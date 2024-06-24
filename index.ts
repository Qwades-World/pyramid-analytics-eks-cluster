import {
    awsIMDBInstance,
    awsGCADInstance,
    awsGCGROUPInstance,
    awsGCDEALERInstance
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
export const gcadadminpasswd = awsGCADInstance.publicDns;
export const gcgroupadpasswd = awsGCDEALERInstance.publicDns;
export const gcdealeradminpasswd = awsGCGROUPInstance.publicDns;
export const ec2IMDBInstance = awsIMDBInstance.publicDns;
export const kubeconfig = eksCluster.kubeconfig;
export const rdsEndpoint = rds.endpoint;
export const rdsPort = rds.port;
export const vpcId = eksVpc.vpcId;
