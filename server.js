const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const { getAllMessages, addMessage } = require('./model/messages');

const app = express();

/** Allow server to receive form data and json */
app.use(express.json());
app.use(express.urlencoded());

/** Allow client to reach /public folder */
app.use(express.static('public'));

/** Get all messages */
app.get('/api/messages', (_, res) => {
	res.json({ messages: getAllMessages() });
});

const server = http.createServer(app);

/** Setup web sockets */
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
	ws.on('message', (message) => {
		const parsedMessage = JSON.parse(message);
		addMessage(parsedMessage);
		wss.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(parsedMessage));
			}
		});
	});
});

/** Spin up the server */
server.listen(3000, '127.0.0.1', () => {
	console.log('Listening on http://127.0.0.1:3000');
});
