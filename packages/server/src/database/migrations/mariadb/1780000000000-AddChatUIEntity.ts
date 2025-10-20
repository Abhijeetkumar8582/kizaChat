import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddChatUIEntity1780000000000 implements MigrationInterface {
    name = 'AddChatUIEntity1780000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE \`chat_ui\` (
                \`id\` varchar(36) NOT NULL,
                \`botId\` varchar(36) NOT NULL,
                \`theme\` varchar(20) NOT NULL DEFAULT 'LIGHT',
                \`primaryColor\` text,
                \`secondaryColor\` text,
                \`backgroundColor\` text,
                \`textColor\` text,
                \`fontFamily\` text,
                \`borderRadius\` text,
                \`boxShadow\` text,
                \`position\` varchar(20) NOT NULL DEFAULT 'BOTTOM_RIGHT',
                \`iconUrl\` text,
                \`greeting\` text,
                \`quickReplies\` text,
                \`bubbleStyle\` text,
                \`avatarUrl\` text,
                \`showTypingIndicator\` tinyint(1) NOT NULL DEFAULT 1,
                \`showTimestamp\` tinyint(1) NOT NULL DEFAULT 1,
                \`enableFileUpload\` tinyint(1) NOT NULL DEFAULT 1,
                \`enableMarkdown\` tinyint(1) NOT NULL DEFAULT 1,
                \`highContrast\` tinyint(1) NOT NULL DEFAULT 0,
                \`screenReaderSupport\` tinyint(1) NOT NULL DEFAULT 1,
                \`ariaLabel\` text,
                \`embedCode\` longtext,
                \`version\` text,
                \`isProduction\` tinyint(1) NOT NULL DEFAULT 0,
                \`workspaceId\` varchar(36),
                \`createdDate\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updatedDate\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (\`id\`),
                KEY \`FK_chat_ui_bot\` (\`botId\`),
                CONSTRAINT \`FK_chat_ui_bot\` FOREIGN KEY (\`botId\`) REFERENCES \`bot\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
            ) ENGINE=InnoDB`
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`chat_ui\``)
    }
}

