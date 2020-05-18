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
			startTransaction();
		});
	} catch (err) {
		console.log("There was an error");
	}
}

async function startTransaction() {
	let products = await getProducts();
	let productsWithoutId = products.map(({ item_id, ...product }) => product);
	console.table(productsWithoutId);

	let response = await inquirer.prompt([
		{
			type: "list",
			name: "item_id",
			message: "What would you like to buy?",
			choices: products.map((e) => ({
				name: e.name,
				value: e.item_id,
			})),
		},
		{
			type: "number",
			name: "quantity",
			message: "How many would you like?",
		},
	]);
	let { item_id, quantity } = response;
	let { price, stock_quantity } = await getItem(item_id);

	if (response.quantity > stock_quantity) {
		console.log(highlight("Insufficient Quantity!"));
		return againPrompt();
	} else {
		console.log(highlight(`Your total is ${price * quantity}`));
	}

	let confirm = await inquirer.prompt([
		{ type: "confirm", message: "Complete purchase?", name: "ok" },
	]);

	if (confirm.ok) {
		completePurchase(item_id, quantity);
	} else {
		console.log(highlight("Transaction Cancelled"));
	}
	return againPrompt();
}

async function againPrompt() {
	let again = await inquirer.prompt({
		type: "confirm",
		message: "Make another purchase?",
		name: "ok",
	});

	if (again.ok) {
		startTransaction();
	} else {
		connection.end();
	}
}

function getProducts() {
	let query =
		"SELECT item_id, product_name name, department_name department, price, stock_quantity quantity FROM `products`";
	return sqlQuery(query);
}

async function getItem(id) {
	let query = `SELECT stock_quantity, price FROM products WHERE ?`;
	let result = await sqlQuery(query, { item_id: id });

	return { price: result[0].price, stock_quantity: result[0].stock_quantity };
}

function completePurchase(id, quantity) {
	let query = `UPDATE products SET stock_quantity = stock_quantity - ${quantity}, sold_quantity = sold_quantity + ${quantity} WHERE ? `;
	sqlQuery(query, { item_id: id });
}
function sqlQuery(query, vars = {}) {
	return new Promise((resolve, reject) => {
		connection.query(query, vars, (err, res) => {
			if (err) throw err;
			if (res.length === 0) reject("No Results");
			resolve(res);
		});
	});
}
function highlight(words) {
	return `\n**************\n${words}\n**************\n`;
}
