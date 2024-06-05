import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { eksVpc, securityGroup } from "./networking";

const config = new pulumi.Config();
const ec2KeyName = config.get("ec2KeyName");

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

const ebsVol = new aws.ebs.Volume("pyramid-imdb-001", {
  availabilityZone: "us-east-1b",
  finalSnapshot: true,
  size: 100,
  tags: {
      Name: "Pyramid-IMDB-Volume-001",
  },
});

export const awsInstanceResource = new aws.ec2.Instance("pyramid-imdb-instance", {    
    ami: ubuntu.then((ubuntu) => ubuntu.id),
    associatePublicIpAddress: false,
    availabilityZone: "us-east-1b",
    disableApiStop: false,
    disableApiTermination: true,
    ebsOptimized: true,
    instanceType: "t3.2xlarge",
    keyName: ec2KeyName,
    monitoring: true,
    rootBlockDevice: {
        deleteOnTermination: false,
        deviceName: "/dev/sda1",
        encrypted: false,
        tags: {
            string: "env:production",
        },
        volumeSize: 50,
        volumeType: "gp3",
    },
    subnetId: eksVpc.privateSubnetIds[0],
    tags: {
        string: "env:production",
    },
    vpcSecurityGroupIds: [securityGroup.id],
});

const ebsAtt = new aws.ec2.VolumeAttachment("pyramid-imdb-001-attach", {
  deviceName: "/dev/sdh",
  volumeId: ebsVol.id,
  instanceId: awsInstanceResource.id,
  stopInstanceBeforeDetaching: true,
});