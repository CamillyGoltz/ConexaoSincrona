const express = require('express');
const axios = require('axios');
const amqp = require('amqplib');
const app = express();

app.use(express.json());

let orders = [
  { id: 1, customer: 'Cliente 1', products: [1, 2] },
  { id: 2, customer: 'Cliente 2', products: [2] }
];

let channel, connection;
const QUEUE = 'pedidoQueue';

// Conectar ao RabbitMQ
async function connectRabbitMQ() {
  try {
    connection = await amqp.connect('amqp://localhost');
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE);
    console.log('Orders API conectada ao RabbitMQ');
  } catch (error) {
    console.error('Erro ao conectar ao RabbitMQ:', error);
  }
}

// Rota para enviar um pedido
app.post('/orders', async (req, res) => {
  const newOrder = {
    id: orders.length + 1,
    customer: req.body.customer,
    products: req.body.products
  };
  orders.push(newOrder);

  // Enviar a mensagem para o RabbitMQ
  try {
    const message = JSON.stringify(newOrder);
    channel.sendToQueue(QUEUE, Buffer.from(message));
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao enviar o pedido para o RabbitMQ', error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Orders API rodando em http://localhost:3000');
  connectRabbitMQ();
});