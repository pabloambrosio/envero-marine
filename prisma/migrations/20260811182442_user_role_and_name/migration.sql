-- AlterTable
ALTER TABLE `user` ADD COLUMN `name` VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN `role` ENUM('admin', 'staff') NOT NULL DEFAULT 'staff';

-- Backfill: todos los usuarios pre-rol son el cliente → admin.
UPDATE `user` SET `role` = 'admin';
