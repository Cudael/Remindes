-- Add enhanced fields to Item
ALTER TABLE "Item" ADD COLUMN "category" TEXT;
ALTER TABLE "Item" ADD COLUMN "itemClass" TEXT;
ALTER TABLE "Item" ADD COLUMN "itemTypeId" TEXT;
ALTER TABLE "Item" ADD COLUMN "expirationDate" TIMESTAMP(3);
ALTER TABLE "Item" ADD COLUMN "documentNumber" TEXT;
ALTER TABLE "Item" ADD COLUMN "renewalDate" TIMESTAMP(3);
ALTER TABLE "Item" ADD COLUMN "billingCycle" TEXT;
ALTER TABLE "Item" ADD COLUMN "price" DOUBLE PRECISION;
ALTER TABLE "Item" ADD COLUMN "notes" TEXT;
ALTER TABLE "Item" ADD COLUMN "dynamicFields" JSONB;
ALTER TABLE "Item" ADD COLUMN "reminderDaysBefore" INTEGER DEFAULT 7;

-- Add itemClass to ItemType (add column with default, then we keep default)
ALTER TABLE "ItemType" ADD COLUMN "itemClass" TEXT NOT NULL DEFAULT 'document';

-- CreateTable Notification
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "notificationType" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isSentViaEmail" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex on Item new fields
CREATE INDEX "Item_category_idx" ON "Item"("category");
CREATE INDEX "Item_itemClass_idx" ON "Item"("itemClass");
CREATE INDEX "Item_expirationDate_idx" ON "Item"("expirationDate");
CREATE INDEX "Item_renewalDate_idx" ON "Item"("renewalDate");

-- CreateIndex on ItemType new field
CREATE INDEX "ItemType_isActive_idx" ON "ItemType"("isActive");

-- CreateIndex on Notification
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- AddForeignKey for Item -> ItemType
ALTER TABLE "Item" ADD CONSTRAINT "Item_itemTypeId_fkey" FOREIGN KEY ("itemTypeId") REFERENCES "ItemType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey for Notification -> User
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey for Notification -> Item
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
