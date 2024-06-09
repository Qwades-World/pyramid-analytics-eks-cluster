import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { eksVpc, securityGroupEC2 } from "./networking";
import { userData } from "./userData";

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
  finalSnapshot: true,
  size: 100,
  tags: {
    Name: "Pyramid-IMDB-Volume-001",
    Environment: "production",
  },
});

// Enforce IMDSv2
const enforce_imdsv2 = new aws.ec2.InstanceMetadataDefaults("enforce-imdsv2", {
  httpTokens: "required",
  httpPutResponseHopLimit: 1,
  httpEndpoint: "enabled",
});

// Create EC2 instance for IMDB data
export const awsInstanceResource = new aws.ec2.Instance("pyramid-imdb-instance", {
  ami: ubuntu.then((ubuntu) => ubuntu.id),
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
  rootBlockDevice: {
    deleteOnTermination: false,
    encrypted: false,
    tags: {
      string: "env:production",
    },
    volumeSize: 50,
    volumeType: "gp3",
  },
  subnetId: eksVpc.publicSubnetIds[1],
  tags: {
    Name: "Pyramid IMDB Instance",
    Environment: "production",
  },
  userData: userData,
  vpcSecurityGroupIds: [securityGroupEC2.id],
});

// Attach IMDB data volume to EC2 instance
export const ebsAtt = new aws.ec2.VolumeAttachment("pyramid-imdb-001-attach", {
  deviceName: "/dev/sdh",
  instanceId: awsInstanceResource.id,
  stopInstanceBeforeDetaching: true,
  volumeId: ebsVol.id,
});