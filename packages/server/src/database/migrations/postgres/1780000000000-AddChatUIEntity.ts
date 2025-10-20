import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddChatUIEntity1780000000000 implements MigrationInterface {
    name = 'AddChatUIEntity1780000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "chat_ui" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "botId" uuid NOT NULL,
                "theme" character varying(20) NOT NULL DEFAULT 'LIGHT',
                "primaryColor" text,
                "secondaryColor" text,
                "backgroundColor" text,
                "textColor" text,
                "fontFamily" text,
                "borderRadius" text,
                "boxShadow" text,
                "position" character varying(20) NOT NULL DEFAULT 'BOTTOM_RIGHT',
                "iconUrl" text,
                "greeting" text,
                "quickReplies" text,
                "bubbleStyle" text,
                "avatarUrl" text,
                "showTypingIndicator" boolean NOT NULL DEFAULT true,
                "showTimestamp" boolean NOT NULL DEFAULT true,
                "enableFileUpload" boolean NOT NULL DEFAULT true,
                "enableMarkdown" boolean NOT NULL DEFAULT true,
                "highContrast" boolean NOT NULL DEFAULT false,
                "screenReaderSupport" boolean NOT NULL DEFAULT true,
                "ariaLabel" text,
                "embedCode" text,
                "version" text,
                "isProduction" boolean NOT NULL DEFAULT false,
                "workspaceId" uuid,
                "createdDate" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedDate" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_chat_ui" PRIMARY KEY ("id")
            )`
        )
        
        await queryRunner.query(
            `ALTER TABLE "chat_ui" ADD CONSTRAINT "FK_chat_ui_bot" FOREIGN KEY ("botId") REFERENCES "bot"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat_ui" DROP CONSTRAINT "FK_chat_ui_bot"`)
        await queryRunner.query(`DROP TABLE "chat_ui"`)
    }
}

