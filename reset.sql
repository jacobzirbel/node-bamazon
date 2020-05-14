DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;
USE bamazon;

CREATE TABLE products(
	item_id INT AUTO_INCREMENT NOT NULL,
	product_name VARCHAR(50) NOT NULL,
	department_name VARCHAR(50) NOT NULL,
	price INT NOT NULL,
	stock_quantity INT NOT NULL,
    PRIMARY KEY(item_id)
);

INSERT INTO products (product_name, department_name,price,stock_quantity) VALUES ('iPhone','Electronics',100,20);
INSERT INTO products (product_name, department_name,price,stock_quantity) VALUES ('T-Shirt','Clothing',50,10);
INSERT INTO products (product_name, department_name,price,stock_quantity) VALUES ('Jeans','Clothing',20,100);
INSERT INTO products (product_name, department_name,price,stock_quantity) VALUES ('Charger','Electronics',360,45);
INSERT INTO products (product_name, department_name,price,stock_quantity) VALUES ('Toothbrush','Home',100,5);
INSERT INTO products (product_name, department_name,price,stock_quantity) VALUES ('Dishwasher','Home',20,200);
INSERT INTO products (product_name, department_name,price,stock_quantity) VALUES ('Paper','Office',5,50);
INSERT INTO products (product_name, department_name,price,stock_quantity) VALUES ('Pens','Office',0,1);

select * from products;