import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { securityGroup } from "./networking";
import { eksVpc } from "./networking";

const config = new pulumi.Config();
const dbName = config.get("rdsDatabase");
const dbUsername = config.get("rdsUsername");
const dbPassword = config.get("rdsPassword");

// Create an RDS PostgreSQL instance
export const rds = new aws.rds.Instance("pyramidRDSinstance", {
    engine: "postgres",
    instanceClass: "db.t3.micro",
    allocatedStorage: 20,
    dbName: dbName,
    username: dbUsername,
    password: dbPassword,
    vpcSecurityGroupIds: [securityGroup.id],
    dbSubnetGroupName: new aws.rds.SubnetGroup("pyramid-subnet-group", {
        subnetIds: eksVpc.privateSubnetIds,
        description: "RDS Subnet Group",
    }).name,
    skipFinalSnapshot: true,
});
