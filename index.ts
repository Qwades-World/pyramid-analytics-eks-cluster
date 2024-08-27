import {
    awsIMDBInstance,
    awsGCADInstance,
    awsGCGROUPInstance,
    awsGCDEALERInstance
} from "./ec2Instances";
import { eksCluster } from "./eksCluster";
import { eksVpc } from "./networking";
import { rdsEndpoint, rdsPort } from "./rds";

// Export EC2 instance public DNS names
export const ec2PublicDns = {
    gcadAdmin: awsGCADInstance.publicDns,
    gcGroup: awsGCGROUPInstance.publicDns,
    gcDealer: awsGCDEALERInstance.publicDns,
    pyramidImdb: awsIMDBInstance.publicDns,
};

// Export EKS cluster configuration
export const kubeconfig = eksCluster.kubeconfig;

// Export VPC ID
export const vpcId = eksVpc.vpcId;

// Re-export RDS endpoint and port
export { rdsEndpoint, rdsPort };
