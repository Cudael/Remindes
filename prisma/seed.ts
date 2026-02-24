import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const defaultItemTypes = [
  // Travel Documents
  {
    name: "Passport",
    category: "Travel",
    itemClass: "document",
    description: "Government-issued passport for international travel",
    icon: "✈️",
    fieldsConfig: [
      { key: "passportNumber", label: "Passport Number", type: "text", required: true },
      { key: "issuingCountry", label: "Issuing Country", type: "text", required: true },
      { key: "placeOfIssue", label: "Place of Issue", type: "text" },
      { key: "expiryDate", label: "Expiry Date", type: "date", required: true },
    ],
  },
  {
    name: "Visa",
    category: "Travel",
    itemClass: "document",
    description: "Travel visa for international entry",
    icon: "🛂",
    fieldsConfig: [
      { key: "visaType", label: "Visa Type", type: "text", required: true },
      { key: "visaNumber", label: "Visa Number", type: "text" },
      { key: "country", label: "Country", type: "text", required: true },
      { key: "entries", label: "Entries Allowed", type: "select", options: ["Single", "Double", "Multiple"] },
      { key: "expiryDate", label: "Expiry Date", type: "date", required: true },
    ],
  },
  {
    name: "Travel Insurance",
    category: "Travel",
    itemClass: "document",
    description: "Travel insurance policy",
    icon: "🛡️",
    fieldsConfig: [
      { key: "policyNumber", label: "Policy Number", type: "text", required: true },
      { key: "provider", label: "Provider", type: "text", required: true },
      { key: "coverage", label: "Coverage", type: "text" },
      { key: "expiryDate", label: "Expiry Date", type: "date", required: true },
    ],
  },
  // Identification
  {
    name: "Driver License",
    category: "Identification",
    itemClass: "document",
    description: "Government-issued driver license",
    icon: "🪪",
    fieldsConfig: [
      { key: "licenseNumber", label: "License Number", type: "text", required: true },
      { key: "issuingState", label: "Issuing State / Province", type: "text", required: true },
      { key: "class", label: "License Class", type: "text" },
      { key: "expiryDate", label: "Expiry Date", type: "date", required: true },
    ],
  },
  {
    name: "National ID",
    category: "Identification",
    itemClass: "document",
    description: "National identification card",
    icon: "🆔",
    fieldsConfig: [
      { key: "idNumber", label: "ID Number", type: "text", required: true },
      { key: "issuingCountry", label: "Issuing Country", type: "text", required: true },
      { key: "expiryDate", label: "Expiry Date", type: "date" },
    ],
  },
  {
    name: "Social Security Card",
    category: "Identification",
    itemClass: "document",
    description: "Social security card",
    icon: "📋",
    fieldsConfig: [
      { key: "ssnNumber", label: "SSN (last 4 digits)", type: "text" },
      { key: "issuedDate", label: "Issued Date", type: "date" },
    ],
  },
  // Financial
  {
    name: "Credit Card",
    category: "Financial",
    itemClass: "document",
    description: "Credit card details and expiry tracking",
    icon: "💳",
    fieldsConfig: [
      { key: "lastFourDigits", label: "Last 4 Digits", type: "text", required: true },
      { key: "issuer", label: "Card Issuer", type: "text", required: true },
      { key: "creditLimit", label: "Credit Limit", type: "number" },
      { key: "expiryDate", label: "Expiry Date", type: "date", required: true },
    ],
  },
  {
    name: "Bank Account",
    category: "Financial",
    itemClass: "document",
    description: "Bank account information",
    icon: "🏦",
    fieldsConfig: [
      { key: "accountNumber", label: "Account Number (last 4)", type: "text" },
      { key: "bankName", label: "Bank Name", type: "text", required: true },
      { key: "accountType", label: "Account Type", type: "select", options: ["Checking", "Savings", "Money Market"] },
      { key: "routingNumber", label: "Routing Number", type: "text" },
    ],
  },
  // Subscriptions
  {
    name: "Streaming Service",
    category: "Subscription",
    itemClass: "subscription",
    description: "Video or music streaming subscription",
    icon: "📺",
    fieldsConfig: [
      { key: "serviceName", label: "Service Name", type: "text", required: true },
      { key: "plan", label: "Plan", type: "text" },
      { key: "email", label: "Account Email", type: "text" },
    ],
  },
  {
    name: "Software License",
    category: "Subscription",
    itemClass: "subscription",
    description: "Software or app license subscription",
    icon: "💻",
    fieldsConfig: [
      { key: "productName", label: "Product Name", type: "text", required: true },
      { key: "licenseKey", label: "License Key", type: "text" },
      { key: "seats", label: "Number of Seats", type: "number" },
    ],
  },
  {
    name: "Gym Membership",
    category: "Subscription",
    itemClass: "subscription",
    description: "Gym or fitness club membership",
    icon: "🏋️",
    fieldsConfig: [
      { key: "gymName", label: "Gym Name", type: "text", required: true },
      { key: "membershipId", label: "Membership ID", type: "text" },
      { key: "membershipLevel", label: "Membership Level", type: "text" },
    ],
  },
  {
    name: "Cloud Storage",
    category: "Subscription",
    itemClass: "subscription",
    description: "Cloud storage subscription (e.g. Dropbox, iCloud)",
    icon: "☁️",
    fieldsConfig: [
      { key: "provider", label: "Provider", type: "text", required: true },
      { key: "plan", label: "Plan", type: "text" },
      { key: "storageSize", label: "Storage Size", type: "text" },
    ],
  },
  // Insurance
  {
    name: "Health Insurance",
    category: "Insurance",
    itemClass: "document",
    description: "Health insurance policy",
    icon: "🏥",
    fieldsConfig: [
      { key: "policyNumber", label: "Policy Number", type: "text", required: true },
      { key: "provider", label: "Provider", type: "text", required: true },
      { key: "groupNumber", label: "Group Number", type: "text" },
      { key: "coverage", label: "Coverage Type", type: "text" },
      { key: "expiryDate", label: "Expiry Date", type: "date", required: true },
    ],
  },
  {
    name: "Auto Insurance",
    category: "Insurance",
    itemClass: "document",
    description: "Vehicle insurance policy",
    icon: "🚗",
    fieldsConfig: [
      { key: "policyNumber", label: "Policy Number", type: "text", required: true },
      { key: "provider", label: "Provider", type: "text", required: true },
      { key: "vehicleInfo", label: "Vehicle Info", type: "text" },
      { key: "coverage", label: "Coverage Type", type: "text" },
      { key: "expiryDate", label: "Expiry Date", type: "date", required: true },
    ],
  },
  {
    name: "Home Insurance",
    category: "Insurance",
    itemClass: "document",
    description: "Home or renter's insurance policy",
    icon: "🏠",
    fieldsConfig: [
      { key: "policyNumber", label: "Policy Number", type: "text", required: true },
      { key: "provider", label: "Provider", type: "text", required: true },
      { key: "propertyAddress", label: "Property Address", type: "text" },
      { key: "coverage", label: "Coverage Amount", type: "text" },
      { key: "expiryDate", label: "Expiry Date", type: "date", required: true },
    ],
  },
  // Legal
  {
    name: "Lease Agreement",
    category: "Legal",
    itemClass: "document",
    description: "Rental lease or tenancy agreement",
    icon: "⚖️",
    fieldsConfig: [
      { key: "propertyAddress", label: "Property Address", type: "text", required: true },
      { key: "landlord", label: "Landlord / Property Manager", type: "text" },
      { key: "startDate", label: "Start Date", type: "date" },
      { key: "endDate", label: "End Date", type: "date" },
      { key: "monthlyRent", label: "Monthly Rent", type: "number" },
    ],
  },
  {
    name: "Warranty",
    category: "Legal",
    itemClass: "document",
    description: "Product warranty or extended warranty",
    icon: "🛠️",
    fieldsConfig: [
      { key: "productName", label: "Product Name", type: "text", required: true },
      { key: "warrantyNumber", label: "Warranty Number", type: "text" },
      { key: "purchaseDate", label: "Purchase Date", type: "date" },
      { key: "expiryDate", label: "Expiry Date", type: "date", required: true },
    ],
  },
  // Education
  {
    name: "Degree Certificate",
    category: "Education",
    itemClass: "document",
    description: "Academic degree or diploma",
    icon: "🎓",
    fieldsConfig: [
      { key: "institution", label: "Institution", type: "text", required: true },
      { key: "degreeType", label: "Degree Type", type: "text", required: true },
      { key: "major", label: "Major / Field of Study", type: "text" },
      { key: "graduationDate", label: "Graduation Date", type: "date" },
    ],
  },
  {
    name: "Professional License",
    category: "Education",
    itemClass: "document",
    description: "Professional certification or license",
    icon: "📜",
    fieldsConfig: [
      { key: "licenseType", label: "License Type", type: "text", required: true },
      { key: "licenseNumber", label: "License Number", type: "text", required: true },
      { key: "issuingBody", label: "Issuing Body", type: "text" },
      { key: "expiryDate", label: "Expiry Date", type: "date" },
    ],
  },
  // Health
  {
    name: "Vaccination Record",
    category: "Health",
    itemClass: "document",
    description: "Vaccination or immunization record",
    icon: "💉",
    fieldsConfig: [
      { key: "vaccineName", label: "Vaccine Name", type: "text", required: true },
      { key: "dateAdministered", label: "Date Administered", type: "date", required: true },
      { key: "nextDueDate", label: "Next Due Date", type: "date" },
      { key: "provider", label: "Healthcare Provider", type: "text" },
    ],
  },
  {
    name: "Prescription",
    category: "Health",
    itemClass: "document",
    description: "Medical prescription",
    icon: "💊",
    fieldsConfig: [
      { key: "medicationName", label: "Medication Name", type: "text", required: true },
      { key: "dosage", label: "Dosage", type: "text" },
      { key: "prescribingDoctor", label: "Prescribing Doctor", type: "text" },
      { key: "expiryDate", label: "Expiry Date", type: "date" },
    ],
  },
];

async function main() {
  for (const itemType of defaultItemTypes) {
    await prisma.itemType.upsert({
      where: { name: itemType.name },
      update: { itemClass: itemType.itemClass, icon: itemType.icon, fieldsConfig: itemType.fieldsConfig },
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