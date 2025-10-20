import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddEntityAndUpdateVariable1800000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create Entity table
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS "entity" (
                "id" varchar PRIMARY KEY NOT NULL,
                "name" text NOT NULL,
                "description" text,
                "createdDate" datetime NOT NULL DEFAULT (datetime('now')),
                "updatedDate" datetime NOT NULL DEFAULT (datetime('now')),
                "workspaceId" text
            )`
        )

        // Add entityId column to Variable table
        await queryRunner.query(`ALTER TABLE "variable" ADD COLUMN "entityId" varchar`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove entityId column from Variable table
        await queryRunner.query(`ALTER TABLE "variable" DROP COLUMN "entityId"`)
        
        // Drop Entity table
        await queryRunner.query(`DROP TABLE "entity"`)
    }
}

