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
			startSupervisor();
		});
	} catch (err) {
		console.log(highlight("There was an error"));
	}
}

function startSupervisor() {}

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

/* 
GET PRODUCT SALES and PROFIT BY DEPARTMENT: 

SELECT d.department_id, d.department_name, d.overhead_costs, sum(p.sold_quantity*p.price) AS total_sales, 
sum(p.sold_quantity*p.price) - d.overhead_costs as total_profit
FROM departments d, products p
WHERE d.department_name = p.department_name
GROUP BY d.department_id, d.department_name, d.overhead_costs
ORDER BY d.department_id;

*/
