const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const ordersDir = path.join(__dirname, "..", "data");
const ordersFile = path.join(ordersDir, "orders.xlsx");

function ensureWorkbook() {
  if (!fs.existsSync(ordersDir)) {
    fs.mkdirSync(ordersDir, { recursive: true });
  }

  if (!fs.existsSync(ordersFile)) {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, ordersFile);
  }
}

function appendOrderToExcel(order) {
  ensureWorkbook();

  const workbook = XLSX.readFile(ordersFile);
  const sheetName = "Orders";
  const worksheet = workbook.Sheets[sheetName];

  const existingData = worksheet ? XLSX.utils.sheet_to_json(worksheet) : [];

  const row = {
    OrderNumber: order.orderNumber,
    CustomerName: order.customerName,
    CustomerPhone: order.customerPhone,
    CustomerAddress: order.customerAddress,
    Items: order.items
      .map(
        (item) =>
          `${item.name} | qty: ${item.qty} | price: ${item.price} | image: ${item.image || ""}`
      )
      .join(" || "),
    Total: order.total,
    Status: order.status,
    CreatedAt: order.createdAt,
  };

  existingData.push(row);

  const newWorksheet = XLSX.utils.json_to_sheet(existingData);
  workbook.Sheets[sheetName] = newWorksheet;

  if (!workbook.SheetNames.includes(sheetName)) {
    workbook.SheetNames.push(sheetName);
  }

  XLSX.writeFile(workbook, ordersFile);
}

module.exports = { appendOrderToExcel, ordersFile };