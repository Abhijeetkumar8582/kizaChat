import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddEntityAndUpdateVariable1800000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create Entity table
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS \`entity\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`description\` text,
                \`createdDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`workspaceId\` text,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci`
        )

        // Add entityId column to Variable table
        await queryRunner.query(`ALTER TABLE \`variable\` ADD \`entityId\` varchar(36)`)
        
        // Add foreign key constraint
        await queryRunner.query(
            `ALTER TABLE \`variable\` ADD CONSTRAINT \`FK_variable_entity\` 
            FOREIGN KEY (\`entityId\`) REFERENCES \`entity\`(\`id\`) ON DELETE SET NULL`
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key
        await queryRunner.query(`ALTER TABLE \`variable\` DROP FOREIGN KEY \`FK_variable_entity\``)
        
        // Remove entityId column from Variable table
        await queryRunner.query(`ALTER TABLE \`variable\` DROP COLUMN \`entityId\``)
        
        // Drop Entity table
        await queryRunner.query(`DROP TABLE \`entity\``)
    }
}

