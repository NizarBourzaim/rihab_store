const { google } = require("googleapis");
const path = require("path");

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const CREDENTIALS_PATH = path.join(__dirname, "..", "credentials.json");

let sheetsClient = null;

async function getSheetsClient() {
  if (sheetsClient) return sheetsClient;

  let authOptions = {};

  if (process.env.GOOGLE_CREDENTIALS_JSON) {
    try {
      const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
      authOptions = {
        credentials,
        scopes: SCOPES,
      };
      console.log("Google Sheets: Using credentials from Environment Variable");
    } catch (err) {
      console.error("Google Sheets: Failed to parse GOOGLE_CREDENTIALS_JSON env var", err.message);
    }
  } else {
    authOptions = {
      keyFile: CREDENTIALS_PATH,
      scopes: SCOPES,
    };
    console.log("Google Sheets: Using credentials from local credentials.json");
  }

  const auth = new google.auth.GoogleAuth(authOptions);
  const authClient = await auth.getClient();
  sheetsClient = google.sheets({ version: "v4", auth: authClient });
  return sheetsClient;
}

/**
 * Ensures the sheet has headers in the first row.
 * Only writes headers if the sheet is empty.
 */
async function ensureHeaders(sheets, spreadsheetId) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "A1:J1",
  });

  if (!res.data.values || res.data.values.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "A1:J1",
      valueInputOption: "RAW",
      requestBody: {
        values: [
          [
            "Order Number",
            "Customer Name",
            "Phone",
            "Address",
            "Items",
            "Total (MAD)",
            "Status",
            "Date",
          ],
        ],
      },
    });
    console.log("Google Sheets: Headers created");
  }
}

/**
 * Appends an order as a new row to the Google Sheet.
 * @param {Object} order - The Mongoose order document
 */
async function appendOrderToGoogleSheets(order) {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
      console.error("Google Sheets: GOOGLE_SHEET_ID not set in .env");
      return;
    }

    const sheets = await getSheetsClient();

    // Ensure headers exist
    await ensureHeaders(sheets, spreadsheetId);

    // Format items as a readable string
    const itemsStr = order.items
      .map((item) => `${item.name}${item.size ? ` [${item.size}]` : ""} x${item.qty} (${item.price} MAD)`)
      .join(" | ");

    const row = [
      order.orderNumber,
      order.customerName,
      order.customerPhone,
      order.customerAddress || "Not provided",
      itemsStr,
      order.total,
      order.status || "pending",
      new Date(order.createdAt || Date.now()).toLocaleString("en-GB", {
        timeZone: "Africa/Casablanca",
      }),
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "A:H",
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [row],
      },
    });

    console.log(
      `Google Sheets: Order ${order.orderNumber} added successfully`
    );
  } catch (error) {
    console.error("Google Sheets Error:", error.message);
    // Don't throw — we don't want Google Sheets failures to break order creation
  }
}

/**
 * Updates the status of an existing order in the Google Sheet.
 * @param {string} orderNumber - The unique order number to find
 * @param {string} newStatus - The new status string to set
 */
async function updateOrderStatusInGoogleSheets(orderNumber, newStatus) {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) return;

    const sheets = await getSheetsClient();

    // Fetch all values in Column A (Order Numbers) and G (Status)
    // We fetch everything to find the row index.
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "A:G",
    });

    const rows = res.data.values;
    if (!rows || rows.length === 0) return;

    // Find the row where Column A matches the orderNumber
    let rowIndex = -1;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === orderNumber) {
        rowIndex = i;
        break;
      }
    }

    if (rowIndex === -1) {
      console.log(`Google Sheets: Order ${orderNumber} not found for status update`);
      return;
    }

    // Google Sheets rows are 1-indexed. We want to update Column G (index 6, which is "G" in A1 notation)
    const sheetRowNumber = rowIndex + 1;
    const updateRange = `G${sheetRowNumber}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updateRange,
      valueInputOption: "RAW",
      requestBody: {
        values: [[newStatus]],
      },
    });

    console.log(`Google Sheets: Order ${orderNumber} status updated to ${newStatus}`);
  } catch (error) {
    console.error("Google Sheets Update Error:", error.message);
  }
}

module.exports = { appendOrderToGoogleSheets, updateOrderStatusInGoogleSheets };
