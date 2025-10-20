import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddApiEntities1770000000000 implements MigrationInterface {
    name = 'AddApiEntities1770000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "api" (
                "id" varchar PRIMARY KEY NOT NULL, 
                "name" varchar NOT NULL, 
                "description" text, 
                "baseUrl" varchar NOT NULL, 
                "authType" varchar(20) NOT NULL DEFAULT ('NONE'), 
                "authConfig" text, 
                "defaultHeaders" text, 
                "environmentBindings" text, 
                "tags" text, 
                "workspaceId" varchar, 
                "createdDate" datetime NOT NULL DEFAULT (datetime('now')), 
                "updatedDate" datetime NOT NULL DEFAULT (datetime('now'))
            )`
        )
        
        await queryRunner.query(
            `CREATE TABLE "api_request" (
                "id" varchar PRIMARY KEY NOT NULL, 
                "name" varchar NOT NULL, 
                "description" text, 
                "method" varchar(10) NOT NULL, 
                "path" varchar NOT NULL, 
                "headers" text, 
                "params" text, 
                "body" text, 
                "tests" text, 
                "variables" text, 
                "version" text, 
                "changelog" text, 
                "apiId" varchar NOT NULL, 
                "workspaceId" varchar, 
                "createdDate" datetime NOT NULL DEFAULT (datetime('now')), 
                "updatedDate" datetime NOT NULL DEFAULT (datetime('now')), 
                CONSTRAINT "FK_api_request_api" FOREIGN KEY ("apiId") REFERENCES "api" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )`
        )
        
        await queryRunner.query(
            `CREATE TABLE "api_execution" (
                "id" varchar PRIMARY KEY NOT NULL, 
                "requestId" varchar NOT NULL, 
                "status" varchar(20) NOT NULL, 
                "statusCode" integer, 
                "responseHeaders" text, 
                "responseBody" text, 
                "errorMessage" text, 
                "latency" integer, 
                "responseSize" integer, 
                "testResults" text, 
                "variables" text, 
                "workspaceId" varchar, 
                "executedDate" datetime NOT NULL DEFAULT (datetime('now')), 
                CONSTRAINT "FK_api_execution_request" FOREIGN KEY ("requestId") REFERENCES "api_request" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )`
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "api_execution"`)
        await queryRunner.query(`DROP TABLE "api_request"`)
        await queryRunner.query(`DROP TABLE "api"`)
    }
}

