// Utility Functions
const getDate = () => new Date().toLocaleString();
const saveData = (key, data) => localStorage.setItem(key, JSON.stringify(data));
const loadData = (key) => JSON.parse(localStorage.getItem(key)) || [];
const removeRow = (btn) => btn.closest("tr").remove();

function showSection(sectionId) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.getElementById(sectionId).classList.add("active");
  if (sectionId === 'summary') updateSummaryTable();
}

/// Inventory Section
const inventoryForm = document.getElementById("inventoryForm");
const inventoryTable = document.querySelector("#inventoryTable tbody");
let inventoryData = loadData("inventoryData");

inventoryForm.onsubmit = (e) => {
  e.preventDefault();
  const product = invProduct.value.trim();
  const quantity = parseFloat(invQuantity.value);
  
  if (isNaN(quantity) || quantity < 0.1) {
    alert("Please enter quantity of at least 0.1");
    return;
  }

  const time = getDate();
  const entry = { product, quantity, time };
  inventoryData.push(entry);
  saveData("inventoryData", inventoryData);
  appendInventoryRow(entry);
  inventoryForm.reset();
};

function appendInventoryRow({ product, quantity, time }) {
  const row = inventoryTable.insertRow();
  row.innerHTML = `
    <td>${product}</td>
    <td>${quantity.toFixed(3)}</td>
    <td>${time}</td>
    <td><button onclick="this.closest('tr').remove()">Delete</button></td>`;
}

function loadInventory() {
  inventoryTable.innerHTML = "";
  inventoryData.forEach(appendInventoryRow);
}

function clearInventory() {
  inventoryData = [];
  saveData("inventoryData", inventoryData);
  loadInventory();
}

function downloadInventoryExcel() {
  downloadExcel("inventoryTable", "InventoryData");
}

function downloadInventoryPDF() {
  downloadPDF("Inventory Data", "inventoryTable");
}


// Order Section
const orderForm = document.getElementById("orderForm");
const orderTable = document.querySelector("#orderTable tbody");
let orderData = loadData("orderData");

orderForm.onsubmit = (e) => {
  e.preventDefault();
  const name = custName.value.trim();
  const phone = custPhone.value.trim();
  const product = orderProduct.value.trim();
  const price = parseFloat(orderPrice.value);
  const qty = parseFloat(orderQty.value);

  if (isNaN(qty) || qty < 0.1) {
    alert("Please enter a quantity of at least 0.1");
    return;
  }

  const total = parseFloat((price * qty).toFixed(2));
  const time = getDate();
  const entry = { name, phone, product, price, qty, total, time };
  orderData.push(entry);
  saveData("orderData", orderData);
  appendOrderRow(entry);
  orderForm.reset();
};

function appendOrderRow({ name, phone, product, price, qty, total, time }) {
  const row = orderTable.insertRow();
  row.innerHTML = `
    <td>${name}</td>
    <td>${phone}</td>
    <td>${product}</td>
    <td>${price}</td>
    <td>${qty.toFixed(3)}</td>
    <td>${total}</td>
    <td>${time}</td>
    <td><button onclick="this.closest('tr').remove()">Delete</button></td>`;
}

function loadOrders() {
  orderTable.innerHTML = "";
  orderData.forEach(appendOrderRow);
}

function clearOrders() {
  orderData = [];
  saveData("orderData", orderData);
  loadOrders();
}

function searchOrder() {
  const term = document.getElementById("searchCustomer").value.toLowerCase();
  orderTable.innerHTML = "";
  orderData
    .filter(e => e.name.toLowerCase().includes(term) || e.phone.includes(term))
    .forEach(appendOrderRow);
}

function downloadOrderExcel() {
  downloadExcel("orderTable", "CustomerOrders");
}

function downloadOrderPDF() {
  downloadPDF("Customer Orders", "orderTable");
}

// Summary Section
function updateSummaryTable() {
  const summaryTable = document.querySelector("#summaryTable tbody");
  summaryTable.innerHTML = "";
  const summaryMap = {};

  inventoryData.forEach(({ product, quantity }) => {
    summaryMap[product] = (summaryMap[product] || 0) + quantity;
  });

  orderData.forEach(({ product, qty }) => {
    summaryMap[product] = (summaryMap[product] || 0) - qty;
  });

  Object.entries(summaryMap).forEach(([product, remaining]) => {
    const invTotal = inventoryData.filter(p => p.product === product).reduce((sum, e) => sum + e.quantity, 0);
    const ordTotal = orderData.filter(p => p.product === product).reduce((sum, e) => sum + e.qty, 0);
    const row = summaryTable.insertRow();
    row.innerHTML = `<td>${product}</td><td>${invTotal.toFixed(3)}</td><td>${ordTotal.toFixed(3)}</td><td>${remaining.toFixed(3)}</td>`;
  });
}

function clearSummary() {
  document.querySelector("#summaryTable tbody").innerHTML = "";
}

function downloadSummaryExcel() {
  downloadExcel("summaryTable", "InventorySummary");
}

function downloadSummaryPDF() {
  downloadPDF("Inventory Summary", "summaryTable");
}

// Excel & PDF Utils
function downloadExcel(tableId, filename) {
  const table = document.getElementById(tableId);
  const wb = XLSX.utils.table_to_book(table);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

function downloadPDF(title, tableId) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text(title, 14, 10);
  doc.autoTable({ html: `#${tableId}`, startY: 15 });
  doc.save(`${title.replace(/ /g, '_')}.pdf`);
}

// Initial Load
loadInventory();
loadOrders();
showSection("inventory");
