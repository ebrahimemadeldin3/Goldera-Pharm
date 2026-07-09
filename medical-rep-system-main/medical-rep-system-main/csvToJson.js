import xlsx from "xlsx";
import fs from "fs";

// Load Excel file
const workbook = xlsx.readFile("Eastern 1 list.xlsx");

// Get first sheet
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Convert to JSON
const rawData = xlsx.utils.sheet_to_json(sheet);

// Optional: normalize keys
const data = rawData.map((row) => ({
  accountName: row["Account Nme ar"],
  nameAR: row["Contact Name en"],
  nameEN: row["Contact Name ar"],
  specialty: row["Specialty"],
  grade: row["Grade"],
  phone: row["Contact phone"],
  email: row["ContactEmail"],
  area: row["Area"],
  subRegion: "Eastern 1", // Default value, adjust as needed
}));

// Save JSON file
fs.writeFileSync("data.json", JSON.stringify(data, null, 2));

console.log("✅ Excel converted to JSON successfully");
