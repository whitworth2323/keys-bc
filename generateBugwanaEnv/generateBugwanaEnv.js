const fs = require('fs');
const path = require('path');

const jsonFilePath = path.join(__dirname, 'config.json');
const jsFilePath = path.join(__dirname, 'firebaseConfig.js');

// Function to read JSON file
function readJSONFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
}

// Function to read JS file and extract firebaseConfig object
function readJSFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        const match = data.match(/const firebaseConfig = ({.*?});/s);
        if (match) {
          resolve(eval('(' + match[1] + ')'));
        } else {
          reject(new Error('firebaseConfig not found in file'));
        }
      }
    });
  });
}

// Function to write to .env file
function writeToEnvFile(data) {
  const content = Object.entries(data).map(([key, value]) => `${key}=${value}`).join('\n');
  fs.writeFile(path.join(__dirname, 'bugwana.env'), content, (err) => {
    if (err) {
      console.error('Error writing to .env file:', err);
    } else {
      console.log('bugwana.env file created successfully!');
    }
  });
}

// Function to format keys with underscores
function formatKey(key) {
  return key.replace(/([A-Z])/g, '_$1').toUpperCase();
}

// Main function to process files and generate .env
async function generateEnvFile() {
  try {
    const jsonData = await readJSONFile(jsonFilePath);
    const jsData = await readJSFile(jsFilePath);

    // Escaping newline characters properly for the JSON string in .env
    const privateKeyProcessed = jsonData.private_key.replace(/\n/g, '\\n');

    const envData = {
      ...Object.fromEntries(Object.entries(jsData).map(([key, value]) => 
        [`NEXT_PUBLIC_FIREBASE_${formatKey(key)}`, value])),
      NEXT_PUBLIC_CLOUD_FUNCTION_URL: `https://us-central1-${jsonData.project_id}.cloudfunctions.net/app2`,
      FIREBASE_CLIENT_CERT_URL: jsonData.client_x509_cert_url,
      FIREBASE_CLIENT_ID: jsonData.client_id,
      FIREBASE_PRIVATE_KEY_ID: jsonData.private_key_id,
      FIREBASE_CLIENT_EMAIL: jsonData.client_email,
      FIREBASE_PRIVATE_KEY: `{"privateKey": "${privateKeyProcessed}"}`
    };

    writeToEnvFile(envData);
  } catch (error) {
    console.error('Failed to generate .env file:', error);
  }
}

generateEnvFile();
