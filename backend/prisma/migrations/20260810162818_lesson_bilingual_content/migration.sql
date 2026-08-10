-- AlterTable
ALTER TABLE "lessons" ADD COLUMN "title_en" TEXT;
ALTER TABLE "lessons" ADD COLUMN "mdx_content_en" TEXT;
ALTER TABLE "lessons" DROP COLUMN "language";
