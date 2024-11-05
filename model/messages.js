let messages = [];

const getAllMessages = () => {
	return messages;
};

const addMessage = (message) => {
	messages.push(message);
};

const removeMessage = (id) => {
	messages = messages.filter((message) => message.id !== id);
};

module.exports = {
	getAllMessages,
	addMessage,
	removeMessage,
};
