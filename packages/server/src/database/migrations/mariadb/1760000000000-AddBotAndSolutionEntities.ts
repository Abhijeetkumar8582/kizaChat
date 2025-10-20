import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddBotAndSolutionEntities1760000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create Bot table
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS \`bot\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`description\` text,
                \`workspaceId\` text,
                \`createdDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
        )

        // Create Solution table
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS \`solution\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`type\` varchar(20) NOT NULL DEFAULT 'REGULAR',
                \`description\` text,
                \`configuration\` text,
                \`botId\` varchar(36) NOT NULL,
                \`workspaceId\` text,
                \`createdDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                KEY \`IDX_solution_botId\` (\`botId\`),
                CONSTRAINT \`FK_solution_botId\` FOREIGN KEY (\`botId\`) REFERENCES \`bot\` (\`id\`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS \`solution\``)
        await queryRunner.query(`DROP TABLE IF EXISTS \`bot\``)
    }
}

