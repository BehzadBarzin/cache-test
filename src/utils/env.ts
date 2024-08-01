import fs from "fs";
import path from "path";

import dotenv from "dotenv";

// Load .env file based on ENV variable
function loadEnvFile() {
  const currentEnv = process.env.ENV?.trim();
  let envFile = null;

  if (currentEnv === "prod") {
    envFile = ".env.prod";
  } else if (currentEnv === "test") {
    envFile = ".env.test";
  } else if (currentEnv === "dev") {
    envFile = ".env.dev";
  } else {
    console.warn(
      "⚙️ No matching environment found, falling back to .env.dev file."
    );
    envFile = ".env.dev";
  }

  const envFilePath = path.resolve(path.join(__dirname, "..", "..", envFile));

  // Check if the file exists before attempting to load it
  if (!fs.existsSync(envFilePath) || envFile === null) {
    console.error(`❌ Error: File ${envFile} not found.`);
    process.exit(1); // Exit with error
  } else {
    dotenv.config({ path: envFilePath });
    console.log(`⚙️ Using ${envFile} for environment configuration.`);
  }
}

// Call the above function so where this file is imported, it would run
loadEnvFile();
