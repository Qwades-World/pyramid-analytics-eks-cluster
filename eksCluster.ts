import * as pulumi from "@pulumi/pulumi";
import * as eks from "@pulumi/eks";
import { eksVpc } from "./networking";

// Grab some values from the Pulumi configuration (or use default values)
const config = new pulumi.Config();
const minClusterSize = config.getNumber("minClusterSize") || 3;
const maxClusterSize = config.getNumber("maxClusterSize") || 6;
const desiredClusterSize = config.getNumber("desiredClusterSize") || 3;
const eksNodeInstanceType = config.get("eksNodeInstanceType") || "t3.medium";

// Create the EKS cluster
export const eksCluster = new eks.Cluster("pyramid-eks-cluster", {
    vpcId: eksVpc.vpcId,
    publicSubnetIds: eksVpc.publicSubnetIds,
    privateSubnetIds: eksVpc.privateSubnetIds,
    instanceType: eksNodeInstanceType,
    desiredCapacity: desiredClusterSize,
    minSize: minClusterSize,
    maxSize: maxClusterSize,
    nodeAssociatePublicIpAddress: false,
    endpointPrivateAccess: false,
    endpointPublicAccess: true,
    enabledClusterLogTypes: [
        "api",
        "audit",
        "authenticator",
    ],
    version: "1.30",
});
