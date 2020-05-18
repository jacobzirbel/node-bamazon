function Question(
	name,
	message,
	type = "input",
	choices = [],
	when = () => true
) {
	this.name = name;
	this.message = message;
	this.type = type;
	this.choices = choices.map((e, i) => ({ name: e, value: i }));
	this.when = when;
}

module.exports = Question;
