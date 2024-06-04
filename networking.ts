import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const config = new pulumi.Config();
const vpcNetworkCidr = config.get("vpcNetworkCidr") || "10.0.0.0/16";

// Create a new VPC
export const eksVpc = new awsx.ec2.Vpc("pyramid-eks-vpc", {
    enableDnsHostnames: true,
    cidrBlock: vpcNetworkCidr,
});

// Create subnets
export const subnet1 = new aws.ec2.Subnet("mySubnet1", {
    vpcId: eksVpc.vpcId,
    cidrBlock: "192.168.1.0/24",
    availabilityZone: "us-east-1c",
    tags: {
        Name: "pyramid-subnet-1",
    },
});

export const subnet2 = new aws.ec2.Subnet("mySubnet2", {
    vpcId: eksVpc.vpcId,
    cidrBlock: "192.168.2.0/24",
    availabilityZone: "us-east-1d",
    tags: {
        Name: "pyramid-subnet-2",
    },
});

// Create a security group that allows ingress from the subnets
export const securityGroup = new aws.ec2.SecurityGroup("rds-security-group", {
    vpcId: eksVpc.vpcId,
    description: "Allow cluster access to rds instance",
    ingress: [
        { protocol: "tcp", fromPort: 5432, toPort: 5432, cidrBlocks: ["192.168.0.0/16"] },
    ],
    egress: [
        { protocol: "tcp", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
    ],
    tags: {
        Name: "pyramid-rds-security-group",
    },
});