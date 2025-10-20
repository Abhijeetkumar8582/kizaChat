import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddEntityAndUpdateVariable1800000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create Entity table
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS entity (
                id uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" varchar NOT NULL,
                "description" text,
                "createdDate" timestamp NOT NULL DEFAULT now(),
                "updatedDate" timestamp NOT NULL DEFAULT now(),
                "workspaceId" text,
                CONSTRAINT "PK_entity" PRIMARY KEY (id)
            )`
        )

        // Add entityId column to Variable table
        await queryRunner.query(`ALTER TABLE variable ADD COLUMN "entityId" uuid`)
        
        // Add foreign key constraint
        await queryRunner.query(
            `ALTER TABLE variable ADD CONSTRAINT "FK_variable_entity" 
            FOREIGN KEY ("entityId") REFERENCES entity(id) ON DELETE SET NULL`
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key
        await queryRunner.query(`ALTER TABLE variable DROP CONSTRAINT "FK_variable_entity"`)
        
        // Remove entityId column from Variable table
        await queryRunner.query(`ALTER TABLE variable DROP COLUMN "entityId"`)
        
        // Drop Entity table
        await queryRunner.query(`DROP TABLE entity`)
    }
}

