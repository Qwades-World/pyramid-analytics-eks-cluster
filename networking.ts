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
    tags: {
        Name: "pyramid-eks-vpc",
        Environment: "production",
    },
});

// Create a security group for RDS
export const securityGroupRDS = new aws.ec2.SecurityGroup("pyramid-rds-sg", {
    description: "Allow cluster access to RDS instance",
    ingress: [
        { protocol: "tcp", fromPort: 5432, toPort: 5432, cidrBlocks: [vpcNetworkCidr] },
    ],
    egress: [
        { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
    ],
    tags: {
        Name: "pyramid-rds-security-group",
        Environment: "production",
    },
    vpcId: eksVpc.vpcId,
});

// Create a security group for EC2 instances
export const securityGroupEC2 = new aws.ec2.SecurityGroup("pyramid-ec2-sg", {
    description: "Allow external RDP and SSH access to EC2 instances",
    ingress: [
        { protocol: "tcp", fromPort: 22, toPort: 22, cidrBlocks: [extSshAccess], description: "SSH access" },
        { protocol: "tcp", fromPort: 3389, toPort: 3389, cidrBlocks: [extSshAccess], description: "RDP access" },
        { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: [intSshAccess], description: "Internal network access" },
    ],
    egress: [
        { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"], description: "All outbound traffic" },
    ],
    tags: {
        Name: "pyramid-ec2-security-group",
        Environment: "production",
    },
    vpcId: eksVpc.vpcId,
});

// Create a security group for EKS cluster
export const securityGroupEKS = new aws.ec2.SecurityGroup("pyramid-eks-sg", {
    description: "Allow necessary traffic for EKS cluster",
    ingress: [
        { protocol: "tcp", fromPort: 443, toPort: 443, cidrBlocks: [vpcNetworkCidr], description: "HTTPS from VPC" },
    ],
    egress: [
        { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"], description: "All outbound traffic" },
    ],
    tags: {
        Name: "pyramid-eks-security-group",
        Environment: "production",
    },
    vpcId: eksVpc.vpcId,
});