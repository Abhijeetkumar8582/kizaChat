import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddApiEntities1770000000000 implements MigrationInterface {
    name = 'AddApiEntities1770000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "api" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" text,
                "baseUrl" character varying NOT NULL,
                "authType" character varying(20) NOT NULL DEFAULT 'NONE',
                "authConfig" text,
                "defaultHeaders" text,
                "environmentBindings" text,
                "tags" text,
                "workspaceId" uuid,
                "createdDate" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedDate" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_api" PRIMARY KEY ("id")
            )`
        )
        
        await queryRunner.query(
            `CREATE TABLE "api_request" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" text,
                "method" character varying(10) NOT NULL,
                "path" character varying NOT NULL,
                "headers" text,
                "params" text,
                "body" text,
                "tests" text,
                "variables" text,
                "version" text,
                "changelog" text,
                "apiId" uuid NOT NULL,
                "workspaceId" uuid,
                "createdDate" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedDate" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_api_request" PRIMARY KEY ("id")
            )`
        )
        
        await queryRunner.query(
            `CREATE TABLE "api_execution" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "requestId" uuid NOT NULL,
                "status" character varying(20) NOT NULL,
                "statusCode" integer,
                "responseHeaders" text,
                "responseBody" text,
                "errorMessage" text,
                "latency" integer,
                "responseSize" integer,
                "testResults" text,
                "variables" text,
                "workspaceId" uuid,
                "executedDate" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_api_execution" PRIMARY KEY ("id")
            )`
        )
        
        await queryRunner.query(
            `ALTER TABLE "api_request" ADD CONSTRAINT "FK_api_request_api" FOREIGN KEY ("apiId") REFERENCES "api"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        )
        
        await queryRunner.query(
            `ALTER TABLE "api_execution" ADD CONSTRAINT "FK_api_execution_request" FOREIGN KEY ("requestId") REFERENCES "api_request"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "api_execution" DROP CONSTRAINT "FK_api_execution_request"`)
        await queryRunner.query(`ALTER TABLE "api_request" DROP CONSTRAINT "FK_api_request_api"`)
        await queryRunner.query(`DROP TABLE "api_execution"`)
        await queryRunner.query(`DROP TABLE "api_request"`)
        await queryRunner.query(`DROP TABLE "api"`)
    }
}

