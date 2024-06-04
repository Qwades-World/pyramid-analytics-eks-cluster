import * as aws from "@pulumi/aws";
import { securityGroup } from "./networking";
import { eksVpc } from "./networking";

// Create an RDS PostgreSQL instance
export const rds = new aws.rds.Instance("pyramidRDSinstance", {
    engine: "postgres",
    instanceClass: "db.t3.micro",
    allocatedStorage: 20,
    dbName: "pyramid",
    username: "pyramid",
    password: "Password123",
    vpcSecurityGroupIds: [securityGroup.id],
    dbSubnetGroupName: new aws.rds.SubnetGroup("pyramid-subnet-group", {
        subnetIds: eksVpc.privateSubnetIds,
        description: "RDS Subnet Group",
    }).name,
    skipFinalSnapshot: true,
});
