import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const defaultItemTypes = [
  {
    name: "Passport",
    category: "Travel",
    description: "Government-issued passport for international travel",
    icon: "passport",
    fieldsConfig: [
      { key: "passportNumber", label: "Passport Number", type: "text" },
      { key: "issuingCountry", label: "Issuing Country", type: "text" },
      { key: "expiryDate", label: "Expiry Date", type: "date" },
    ],
  },
  {
    name: "Driver License",
    category: "Identification",
    description: "Government-issued driver license",
    icon: "car",
    fieldsConfig: [
      { key: "licenseNumber", label: "License Number", type: "text" },
      { key: "state", label: "State / Province", type: "text" },
      { key: "expiryDate", label: "Expiry Date", type: "date" },
    ],
  },
  {
    name: "National ID",
    category: "Identification",
    description: "National identification card",
    icon: "id-card",
    fieldsConfig: [
      { key: "idNumber", label: "ID Number", type: "text" },
      { key: "expiryDate", label: "Expiry Date", type: "date" },
    ],
  },
  {
    name: "Netflix",
    category: "Subscription",
    description: "Netflix streaming service subscription",
    icon: "tv",
    fieldsConfig: [
      { key: "email", label: "Account Email", type: "text" },
      { key: "plan", label: "Plan", type: "text" },
      { key: "renewalDate", label: "Renewal Date", type: "date" },
    ],
  },
  {
    name: "Spotify",
    category: "Subscription",
    description: "Spotify music streaming subscription",
    icon: "music",
    fieldsConfig: [
      { key: "email", label: "Account Email", type: "text" },
      { key: "plan", label: "Plan", type: "text" },
      { key: "renewalDate", label: "Renewal Date", type: "date" },
    ],
  },
  {
    name: "Health Insurance",
    category: "Insurance",
    description: "Health insurance policy",
    icon: "heart-pulse",
    fieldsConfig: [
      { key: "policyNumber", label: "Policy Number", type: "text" },
      { key: "provider", label: "Provider", type: "text" },
      { key: "expiryDate", label: "Expiry Date", type: "date" },
    ],
  },
];

async function main() {
  for (const itemType of defaultItemTypes) {
    await prisma.itemType.upsert({
      where: { name: itemType.name },
      update: {},
      create: itemType,
    });
  }

  console.log(`Seeded ${defaultItemTypes.length} default item types.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());