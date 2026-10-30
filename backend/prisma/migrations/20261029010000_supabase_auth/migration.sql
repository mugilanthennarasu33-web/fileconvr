-- AlterTable: Adapt User table for Supabase Auth & Google OAuth
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;
