const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const { getAllMessages, addMessage, removeMessage } = require('./model/messages');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

/** Allow server to receive form data and json */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
	ws.on('message', (payload) => {
		const data = JSON.parse(payload);

		console.log(data);

		/** Removing messages */
		if (data.type === 'remove') {
			removeMessage(data.id);

			/** Adding a new message */
		} else if (data.type === 'add') {
			if (data.message.image) {
				const newFileName = Date.now().toString() + data.message.image.name;

				/** A path which can be accessible from the browser url and sent to the user */
				const resultImagePath = `http://${process.env.IP_ADDRESS}:3000/uploads/${newFileName}`;

				/** A path known to server where to put the file */
				const uploadPath = path.join(__dirname, 'public', 'uploads', newFileName);

				const buffer = Buffer.from(data.message.image.data, 'base64');

				fs.writeFile(uploadPath, buffer, (err) => {
					if (err) {
						console.log('ERROR', err);
						return;
					}

					addMessage({
						sender: data.message.sender,
						content: data.message.content,
						imageUrl: resultImagePath,
					});

					wss.clients.forEach((client) => {
						if (client.readyState === WebSocket.OPEN) {
							client.send(
								JSON.stringify({
									type: 'add',
									message: {
										id: data.message.id,
										content: data.message.content,
										sender: data.message.sender,
										imageUrl: resultImagePath,
									},
								}),
							);
						}
					});
				});
			} else {
				addMessage({
					sender: data.message.sender,
					content: data.message.content,
				});

				wss.clients.forEach((client) => {
					if (client.readyState === WebSocket.OPEN) {
						client.send(
							JSON.stringify({
								type: 'add',
								message: {
									id: data.message.id,
									content: data.message.content,
									sender: data.message.sender,
								},
							}),
						);
					}
				});
			}
		}
	});

	ws.on('close', () => {
		console.log('WebSocket connection closed');
	});

	ws.on('error', (error) => {
		console.error('WebSocket error:', error);
	});
});

/** Spin up the server */
server.listen(3000, process.env.IP_ADDRESS, () => {
	console.log('Listening on', process.env.IP_ADDRESS);
});
