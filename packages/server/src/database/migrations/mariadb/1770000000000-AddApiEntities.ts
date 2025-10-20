import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddApiEntities1770000000000 implements MigrationInterface {
    name = 'AddApiEntities1770000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE \`api\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`description\` text,
                \`baseUrl\` varchar(255) NOT NULL,
                \`authType\` varchar(20) NOT NULL DEFAULT 'NONE',
                \`authConfig\` text,
                \`defaultHeaders\` text,
                \`environmentBindings\` text,
                \`tags\` text,
                \`workspaceId\` varchar(36),
                \`createdDate\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updatedDate\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB`
        )
        
        await queryRunner.query(
            `CREATE TABLE \`api_request\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`description\` text,
                \`method\` varchar(10) NOT NULL,
                \`path\` varchar(255) NOT NULL,
                \`headers\` text,
                \`params\` text,
                \`body\` text,
                \`tests\` text,
                \`variables\` text,
                \`version\` text,
                \`changelog\` text,
                \`apiId\` varchar(36) NOT NULL,
                \`workspaceId\` varchar(36),
                \`createdDate\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updatedDate\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (\`id\`),
                KEY \`FK_api_request_api\` (\`apiId\`),
                CONSTRAINT \`FK_api_request_api\` FOREIGN KEY (\`apiId\`) REFERENCES \`api\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
            ) ENGINE=InnoDB`
        )
        
        await queryRunner.query(
            `CREATE TABLE \`api_execution\` (
                \`id\` varchar(36) NOT NULL,
                \`requestId\` varchar(36) NOT NULL,
                \`status\` varchar(20) NOT NULL,
                \`statusCode\` int,
                \`responseHeaders\` text,
                \`responseBody\` longtext,
                \`errorMessage\` text,
                \`latency\` int,
                \`responseSize\` int,
                \`testResults\` text,
                \`variables\` text,
                \`workspaceId\` varchar(36),
                \`executedDate\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (\`id\`),
                KEY \`FK_api_execution_request\` (\`requestId\`),
                CONSTRAINT \`FK_api_execution_request\` FOREIGN KEY (\`requestId\`) REFERENCES \`api_request\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
            ) ENGINE=InnoDB`
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`api_execution\``)
        await queryRunner.query(`DROP TABLE \`api_request\``)
        await queryRunner.query(`DROP TABLE \`api\``)
    }
}

