import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddExecutionOrderToApiRequest1790000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`api_request\` ADD \`executionOrder\` INT NOT NULL DEFAULT 0`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`api_request\` DROP COLUMN \`executionOrder\``)
    }
}

