import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddBotAndSolutionEntities1760000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create Bot table
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS "bot" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" varchar NOT NULL,
                "description" text,
                "workspaceId" text,
                "createdDate" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedDate" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_bot" PRIMARY KEY ("id")
            );`
        )

        // Create Solution table
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS "solution" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" varchar NOT NULL,
                "type" varchar(20) NOT NULL DEFAULT 'REGULAR',
                "description" text,
                "configuration" text,
                "botId" uuid NOT NULL,
                "workspaceId" text,
                "createdDate" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedDate" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_solution" PRIMARY KEY ("id"),
                CONSTRAINT "FK_solution_botId" FOREIGN KEY ("botId") REFERENCES "bot"("id") ON DELETE CASCADE
            );`
        )

        // Create index on botId for better query performance
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_solution_botId" ON "solution" ("botId");`
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_solution_botId"`)
        await queryRunner.query(`DROP TABLE IF EXISTS "solution"`)
        await queryRunner.query(`DROP TABLE IF EXISTS "bot"`)
    }
}

