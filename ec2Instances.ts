import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { eksVpc, securityGroupEC2 } from "./networking";
import { imdbUserData, winUserData } from "./userData";

// Get the EC2 key name
const config = new pulumi.Config();
const ec2KeyName = config.get("ec2KeyName");

// Get the latest Ubuntu 20.04 AMI
const ubuntu = aws.ec2.getAmi({
  mostRecent: true,
  filters: [
    {
      name: "name",
      values: ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"],
    },
    {
      name: "virtualization-type",
      values: ["hvm"],
    },
  ],
  owners: ["099720109477"],
});

// Create volume for IMDB data
const ebsVol = new aws.ebs.Volume("pyramid-imdb-001", {
  availabilityZone: "us-east-1b",
  type: "gp3",
  finalSnapshot: false,
  size: 100,
  tags: {
    Name: "Pyramid-IMDB-Volume-001",
    Environment: "production",
  },
});

// Enforce IMDSv2
const enforceImdsv2 = new aws.ec2.InstanceMetadataDefaults("enforce-imdsv2", {
  httpTokens: "required",
  httpPutResponseHopLimit: 1,
  httpEndpoint: "enabled",
});

// Common EC2 instance configuration
const commonInstanceConfigLinux = {
  associatePublicIpAddress: true,
  availabilityZone: "us-east-1b",
  disableApiStop: false,
  disableApiTermination: true,
  ebsOptimized: true,
  instanceType: "t3.2xlarge",
  keyName: ec2KeyName,
  metadataOptions: {
    httpEndpoint: "enabled",
    httpTokens: "required",
  },
  monitoring: true,
  subnetId: eksVpc.publicSubnetIds[1],
  userDataReplaceOnChange: true,
  vpcSecurityGroupIds: [securityGroupEC2.id],
};

// Common EC2 instance configuration
const commonInstanceConfigWindows = {
  associatePublicIpAddress: true,
  availabilityZone: "us-east-1b",
  disableApiStop: false,
  disableApiTermination: true,
  ebsOptimized: true,
  instanceType: "t3.2xlarge",
  metadataOptions: {
    httpEndpoint: "enabled",
    httpTokens: "required",
  },
  monitoring: true,
  subnetId: eksVpc.publicSubnetIds[1],
  userDataReplaceOnChange: true,
  vpcSecurityGroupIds: [securityGroupEC2.id],
};

// Create EC2 instance for IMDB data
export const awsIMDBInstance = new aws.ec2.Instance("pyramid-imdb-instance", {
  ...commonInstanceConfigLinux,
  ami: ubuntu.then((ubuntu) => ubuntu.id),
  rootBlockDevice: {
    deleteOnTermination: true,
    encrypted: false,
    tags: {
      Environment: "production",
      Name: "Pyramid-Root-Volume-001",
    },
    volumeSize: 50,
    volumeType: "gp3",
  },
  tags: {
    Name: "Pyramid IMDB Instance",
    Environment: "production",
  },
  userData: imdbUserData,
});

// Attach IMDB data volume to EC2 instance
export const ebsAtt = new aws.ec2.VolumeAttachment("pyramid-imdb-001-attach", {
  deviceName: "/dev/sdh",
  instanceId: awsIMDBInstance.id,
  stopInstanceBeforeDetaching: true,
  volumeId: ebsVol.id,
});

// Function to create Windows AD instances
const createWindowsADInstance = (name: string, displayName: string) => {
  return new aws.ec2.Instance(`pyramid-${name}-instance`, {
    ...commonInstanceConfigWindows,
    ami: "ami-04df9ee4d3dfde202",
    rootBlockDevice: {
      deleteOnTermination: true,
      encrypted: false,
      tags: {
        Environment: "production",
        Name: `Pyramid-Root-Volume-${name.toUpperCase()}-001`,
      },
      volumeSize: 100,
      volumeType: "gp3",
    },
    tags: {
      Name: displayName,
      Environment: "production",
    },
    userData: winUserData,
  });
};

// Create AD instances
export const awsGCADInstance = createWindowsADInstance("gcad", "Pyramid Global Corp AD Instance");
export const awsGCGROUPInstance = createWindowsADInstance("gcgroup", "Pyramid Global Group AD Instance");
export const awsGCDEALERInstance = createWindowsADInstance("gcdealers", "Pyramid Global Corp Dealership AD Instance");