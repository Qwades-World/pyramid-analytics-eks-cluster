import * as pulumi from "@pulumi/pulumi";
import * as eks from "@pulumi/eks";
import { eksVpc } from "./networking";

// Grab some values from the Pulumi configuration (or use default values)
const config = new pulumi.Config();
const desiredClusterSize = config.getNumber("desiredClusterSize") || 3;
const eksNodeInstanceType = config.get("eksNodeInstanceType") || "t3.medium";
const maxClusterSize = config.getNumber("maxClusterSize") || 6;
const minClusterSize = config.getNumber("minClusterSize") || 3;

// Create the EKS cluster
export const eksCluster = new eks.Cluster("pyramid-eks-cluster", {
    desiredCapacity: desiredClusterSize,
    enabledClusterLogTypes: [
        "api",
        "audit",
        "authenticator",
    ],
    endpointPrivateAccess: false,
    endpointPublicAccess: true,
    instanceType: eksNodeInstanceType,
    maxSize: maxClusterSize,
    minSize: minClusterSize,
    nodeAssociatePublicIpAddress: false,
    privateSubnetIds: eksVpc.privateSubnetIds,
    publicSubnetIds: eksVpc.publicSubnetIds,
    version: "1.30",
    vpcId: eksVpc.vpcId,
});
