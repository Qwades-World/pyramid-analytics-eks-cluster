import * as aws from "@pulumi/aws";

// Create a new VPC
export const vpc = new aws.ec2.Vpc("myVpc", {
    cidrBlock: "192.168.0.0/16",
    enableDnsHostnames: true,
    enableDnsSupport: true,
    tags: {
        Name: "pyramid-vpc",
    },
});

// Create subnets
export const subnet1 = new aws.ec2.Subnet("mySubnet1", {
    vpcId: vpc.id,
    cidrBlock: "192.168.1.0/24",
    availabilityZone: "us-east-1c",
    tags: {
        Name: "pyramid-subnet-1",
    },
});

export const subnet2 = new aws.ec2.Subnet("mySubnet2", {
    vpcId: vpc.id,
    cidrBlock: "192.168.2.0/24",
    availabilityZone: "us-east-1d",
    tags: {
        Name: "pyramid-subnet-2",
    },
});

// Create a security group that allows ingress from the subnets
export const securityGroup = new aws.ec2.SecurityGroup("mySecurityGroup", {
    vpcId: vpc.id,
    description: "Allow cluster access",
    ingress: [
        { protocol: "all", fromPort: 0, toPort: 0, cidrBlocks: ["192.168.2.0/24"] },
        { protocol: "all", fromPort: 0, toPort: 0, cidrBlocks: ["192.168.1.0/24"] },
    ],
    egress: [
        { protocol: "tcp", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
    ],
    tags: {
        Name: "pyramid-security-group",
    },
});