const mysql = require("mysql");
const inquirer = require("inquirer");
const connectionInfo = require("./connection-info");
const Question = require("./question");
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

function getProducts() {
	let query = "SELECT * FROM `products`";
	return sqlQuery(query);
}

async function getQuantity(id) {
	let query = `SELECT stock_quantity FROM products WHERE ?`;
	let result = await sqlQuery(query, { item_id: id });
	return result[0].stock_quantity;
}

function sqlQuery(query, vars = {}) {
	return new Promise((resolve, reject) => {
		connection.query(query, vars, (err, res) => {
			if (err) throw err;
			resolve(res);
		});
	});
}

async function startTransaction() {
	let response = await inquirer.prompt([
		{
			type: "confirm",
			name: "buy",
			message: "would you like to buy something?",
		},
	]);
	if (response.buy) {
		let products = await getProducts();
		let response = await inquirer.prompt([
			{
				type: "list",
				name: "item",
				message: "What would you like to buy?",
				choices: products.map((e) => ({
					name: e.product_name,
					value: e.item_id,
				})),
			},
		]);
		console.log(await getQuantity(response.item));
		startTransaction();
	} else {
		connection.end();
	}
}
