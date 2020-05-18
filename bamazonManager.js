const mysql = require("mysql");
const inquirer = require("inquirer");
const connectionInfo = require("./connection-info");
let connection = mysql.createConnection(connectionInfo);

main();

function main() {
	try {
		connection.connect(function (err) {
			if (err) throw err;
			console.log("connected as id " + connection.threadId);
			startManager();
		});
	} catch (err) {
		console.log(highlight("There was an error"));
	}
}

function startManager() {
	let actions = [
		{ name: "View Products for Sale", value: viewProducts },
		{ name: "View Low Inventory", value: viewLowInventory },
		{ name: "Add to Inventory", value: addToInventory },
		{ name: "Add New Product", value: addNewProduct },
	];
	inquirer
		.prompt([
			{
				name: "action",
				type: "list",
				message: "what would you like to do?",
				choices: actions,
			},
		])
		.then((response) => {
			response.action();
		});
}

function viewProducts() {
	sqlQuery(`SELECT * FROM products`)
		.then((products) => {
			console.table(products);
		})
		.catch((err) => console.log(err))
		.finally(startManager);
}

function viewLowInventory() {
	sqlQuery(`SELECT * FROM products WHERE stock_quantity < 0`)
		.then((products) => {
			if (products) {
				console.table(products);
			} else {
				console.log(highlight("No Results"));
			}
		})
		.catch((err) => {
			console.log(err);
		})
		.finally(startManager);
}

function addToInventory() {
	sqlQuery(`SELECT item_id, product_name FROM products`).then((products) => {
		productChoices = products.map((e) => ({
			name: e.product_name,
			value: e.item_id,
		}));

		inquirer
			.prompt([
				{
					name: "product",
					message: "Which Product?",
					type: "list",
					choices: productChoices,
				},
				{
					name: "amount",
					message: "How many do you want to add?",
					type: "number",
				},
			])
			.then((response) => {
				let { product, amount } = response;
				if (!numberValidator(amount)) return startManager();

				sqlQuery(
					`UPDATE products SET stock_quantity = stock_quantity + ${amount} WHERE ?`,
					{ item_id: product }
				).then(startManager);
			});
	});
}

async function addNewProduct() {
	let departments = await getDepartments();
	departments.push("-- new --");
	inquirer
		.prompt([
			{ name: "name", message: "Product Name?" },
			{
				name: "department",
				message: "What Department?",
				type: "list",
				choices: departments,
			},
			{
				name: "newDepartment",
				message: "Name of new Department?",
				when: (answers) => answers.department === "-- new --",
			},
			{ name: "price", message: "Price?", type: "number" },
			{ name: "quantity", message: "Initial Quantity?", type: "number" },
		])
		.then(addRowToTable)
		.catch(startManager);
}
function addRowToTable(response) {
	let { name, department, newDepartment, price, quantity } = response;
	if (newDepartment) department = newDepartment;

	if (!numberValidator(price) || !numberValidator(quantity))
		return startManager();

	let query = `INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ('${name}','${department}',${price},${quantity})`;
	sqlQuery(query).finally(startManager);
}
async function getDepartments() {
	let departments = await sqlQuery(
		`SELECT DISTINCT department_name FROM products`
	);
	return departments.map((e) => e.department_name);
}
function sqlQuery(query, vars = {}) {
	return new Promise((resolve, reject) => {
		connection.query(query, vars, (err, res) => {
			if (err) reject(err);
			if (!res || res.length === 0) resolve(0);
			resolve(res);
		});
	});
}

function highlight(words) {
	return `\n**************\n${words}\n**************\n`;
}

function numberValidator(amount) {
	if (amount > 1000000 || amount < 1 || isNaN(amount)) {
		console.log(highlight("Invalid Number"));
		return false;
	}
	return true;
}
