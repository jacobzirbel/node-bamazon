const mysql = require("mysql");
const inquirer = require("inquirer");
const connectionInfo = require("./connection-info");
let connection = mysql.createConnection(connectionInfo);

main();

function main() {
	try {
		connection.connect(function (err) {
			if (err) throw err;
			// console.log("connected as id " + connection.threadId);
			startSupervisor();
		});
	} catch (err) {
		console.log(highlight("There was an error"));
	}
}

function startSupervisor() {
	let actions = [
		{ name: "View Departments", value: viewSalesByDepartment },
		{ name: "Create New Department", value: createDepartment },
	];
	inquirer
		.prompt([
			{
				name: "action",
				message: "What would you like to do?",
				type: "list",
				choices: actions,
			},
			{
				name: "name",
				message: "Name of department?",
				when: (answers) => answers.action === createDepartment,
			},

			{
				name: "cost",
				message: "Overhead Cost?",
				when: (answers) => answers.action === createDepartment,
			},
		])
		.then((response) => response.action(response.name, response.cost));
}

function createDepartment(departmentName, overheadCosts) {
	let query = `INSERT INTO departments (department_name, overhead_costs)
	values ('${departmentName}', ${overheadCosts})`;
	sqlQuery(query)
		.catch(() => console.log(highlight("There was an error")))
		.finally(startSupervisor);
}

function viewSalesByDepartment() {
	let query = `SELECT d.department_id, d.department_name, d.overhead_costs, 
		sum(p.sold_quantity*p.price) AS total_sales, 
		sum(p.sold_quantity*p.price) - d.overhead_costs as total_profit
	FROM departments d, products p
	WHERE d.department_name = p.department_name
	GROUP BY d.department_id, d.department_name, d.overhead_costs
	ORDER BY d.department_id;`;
	sqlQuery(query)
		.then((res) => {
			console.table(res);
		})
		.catch(() => console.log(highlight("There was an error")))
		.finally(startSupervisor);
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
