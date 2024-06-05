import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const config = new pulumi.Config();
const vpcNetworkCidr = config.get("vpcNetworkCidr") || "10.0.0.0/16";

// Create a new VPC to host the EKS cluster
export const eksVpc = new awsx.ec2.Vpc("pyramid-eks-vpc", {
    enableDnsHostnames: true,
    cidrBlock: vpcNetworkCidr,
});

// Create a security group that allows access to the RDS instance from the EKS cluster
export const securityGroup = new aws.ec2.SecurityGroup("pyramid-rds-sg", {
    vpcId: eksVpc.vpcId,
    description: "Allow cluster access to rds instance",
    ingress: [
        { protocol: "tcp", fromPort: 5432, toPort: 5432, cidrBlocks: [vpcNetworkCidr] },
    ],
    egress: [
        { protocol: "tcp", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
    ],
    tags: {
        Name: "pyramid-rds-security-group",
    },
});