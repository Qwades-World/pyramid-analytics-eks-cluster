import * as aws from "@pulumi/aws";
import { securityGroup, subnet1, subnet2 } from "./networking";
import { eksVpc } from "./networking";

// Create an RDS PostgreSQL instance
export const rds = new aws.rds.Instance("mypostgresinstance", {
    engine: "postgres",
    instanceClass: "db.t3.micro",
    allocatedStorage: 20,
    dbName: "pyramid",
    username: "pyramid",
    password: "Password123",
    vpcSecurityGroupIds: [securityGroup.id],
    dbSubnetGroupName: new aws.rds.SubnetGroup("pyramid-subnet-group", {
        subnetIds: [subnet1.id, subnet2.id],
        description: "RDS Subnet Group",
    }).name,
    skipFinalSnapshot: true,
});
