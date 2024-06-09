import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

// Retrieve configuration values with defaults
const config = new pulumi.Config();
const extSshAccess = config.get("extSshAccess") || "0.0.0.0/0";
const intSshAccess = config.get("intSshAccess") || "192.168.0.0/16";
const vpcNetworkCidr = config.get("vpcNetworkCidr") || "10.0.0.0/16";

// Create a new VPC to host the EKS cluster
export const eksVpc = new awsx.ec2.Vpc("pyramid-eks-vpc", {
    availabilityZoneNames: ["us-east-1a", "us-east-1b", "us-east-1c"],
    cidrBlock: vpcNetworkCidr,
    enableDnsHostnames: true,
    subnetStrategy: awsx.ec2.SubnetAllocationStrategy.Legacy,
});

// Create a security group that allows access to the RDS instance from the EKS cluster
export const securityGroupRDS = new aws.ec2.SecurityGroup("pyramid-rds-sg", {
    description: "Allow cluster access to rds instance",
    ingress: [
        { protocol: "tcp", fromPort: 5432, toPort: 5432, cidrBlocks: [vpcNetworkCidr] }, // Allow PostgreSQL access
    ],
    egress: [
        { protocol: "tcp", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] }, // Allow all outbound traffic
    ],
    tags: {
        Name: "pyramid-rds-security-group",
        Environment: "production",
    },
    vpcId: eksVpc.vpcId,
});

// Create a security group that allows SSH access to the EC2 instanc
export const securityGroupEC2 = new aws.ec2.SecurityGroup("pyramid-ec2-sg", {
    description: "Allow external SSH access to EC2",
    ingress: [
        { protocol: "tcp", fromPort: 22, toPort: 22, cidrBlocks: [extSshAccess] }, // Allow SSH access from the internet
        { protocol: "tcp", fromPort: 22, toPort: 22, cidrBlocks: [intSshAccess] }, // Allow SSH access from the internal network
    ],
    egress: [
        { protocol: "tcp", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] }, // Allow all outbound traffic
    ],
    tags: {
        Name: "pyramid-ec2-security-group",
        Environment: "production",
    },
    vpcId: eksVpc.vpcId,
});