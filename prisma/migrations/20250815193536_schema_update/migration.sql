-- CreateEnum
CREATE TYPE "public"."TravelMode" AS ENUM ('PLANE', 'CAR', 'TRAIN', 'BOAT', 'BUS', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."DestinationType" AS ENUM ('CITY', 'NATURE', 'BEACH', 'MOUNTAINS', 'ADVENTURE', 'RELAXATION', 'CULTURAL');

-- CreateTable
CREATE TABLE "public"."Trip" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "startsOn" TIMESTAMP(3) NOT NULL,
    "endsOn" TIMESTAMP(3) NOT NULL,
    "destination" TEXT NOT NULL,
    "tags" TEXT[],
    "coverImage" TEXT,
    "travelMode" "public"."TravelMode" NOT NULL DEFAULT 'PLANE',
    "destinationCoordinates" TEXT,
    "packingList" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LinkTree" (
    "id" TEXT NOT NULL,
    "googlePhotos" TEXT,
    "dropbox" TEXT,
    "googleDrive" TEXT,
    "travelWebsite" TEXT,
    "customLinks" TEXT[],
    "tripId" TEXT NOT NULL,

    CONSTRAINT "LinkTree_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Metadata" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "state" TEXT,
    "totalDays" INTEGER NOT NULL,
    "destinationType" "public"."DestinationType" NOT NULL DEFAULT 'CITY',
    "continent" TEXT,
    "tripId" TEXT NOT NULL,

    CONSTRAINT "Metadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LinkTree_tripId_key" ON "public"."LinkTree"("tripId");

-- CreateIndex
CREATE UNIQUE INDEX "Metadata_tripId_key" ON "public"."Metadata"("tripId");

-- AddForeignKey
ALTER TABLE "public"."Trip" ADD CONSTRAINT "Trip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LinkTree" ADD CONSTRAINT "LinkTree_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "public"."Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Metadata" ADD CONSTRAINT "Metadata_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "public"."Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
