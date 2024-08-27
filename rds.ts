import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { securityGroupRDS, eksVpc } from "./networking";

// Get config values for RDS database
const config = new pulumi.Config();
const dbName = config.require("rdsDatabase");
const dbUsername = config.require("rdsUsername");
const dbPassword = config.requireSecret("rdsPassword");

// Create RDS Subnet Group
const rdsSubnetGroup = new aws.rds.SubnetGroup("pyramid-subnet-group", {
    subnetIds: eksVpc.privateSubnetIds,
    description: "RDS Subnet Group",
});

// Create an RDS PostgreSQL instance
export const rds = new aws.rds.Instance("pyramid-rds-instance", {
    engine: "postgres",
    engineVersion: "15.4",
    instanceClass: "db.t3.micro",
    allocatedStorage: 20,
    maxAllocatedStorage: 100,
    dbName: dbName,
    username: dbUsername,
    password: dbPassword,
    vpcSecurityGroupIds: [securityGroupRDS.id],
    dbSubnetGroupName: rdsSubnetGroup.name,
    skipFinalSnapshot: true,
    backupRetentionPeriod: 7,
    multiAz: true,
    performanceInsightsEnabled: true,
    tags: {
        Name: "Pyramid RDS Instance",
        Environment: "production",
    },
});

// Export connection information
export const rdsEndpoint = rds.endpoint;
export const rdsPort = rds.port;
