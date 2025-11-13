-- AlterTable
ALTER TABLE "issues" ADD COLUMN     "boardId" TEXT;

-- CreateIndex
CREATE INDEX "issues_boardId_idx" ON "issues"("boardId");

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
