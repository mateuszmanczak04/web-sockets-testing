const fs = require('fs');
const path = require('path');

const getAllMessages = () => {
	try {
		const messagesFile = fs.readFileSync(
			path.join(__dirname, '../database/messages.json'),
			'utf-8',
		);
		messages = JSON.parse(messagesFile);
		return messages;
	} catch (error) {
		console.error('Error while reading messages data', error);
	}
};

const addMessage = (message) => {
	const messagesFile = fs.readFileSync(
		path.join(__dirname, '../database/messages.json'),
		'utf-8',
	);
	messages = JSON.parse(messagesFile);
	messages.push(message);
	fs.writeFileSync(path.join(__dirname, '../database/messages.json'), JSON.stringify(messages));
};

module.exports = {
	getAllMessages,
	addMessage,
};
