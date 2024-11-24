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

// Rota para obter todos os pedidos
app.get('/orders', (req, res) => {
  res.json(orders);
});

// Rota para obter um pedido específico
app.get('/orders/:id', async (req, res) => {
  const order = orders.find(o => o.id === parseInt(req.params.id));
  if (!order) return res.status(404).json({ message: 'Order not found' });

  try {
    const productDetails = await Promise.all(
      order.products.map(productId => axios.get(`http://localhost:3001/products/${productId}`))
    );
    const products = productDetails.map(response => response.data);
    res.json({ ...order, products });
  } catch (error) {
    res.status(500).json({ message: 'Error getting products', error: error.message });
  }
});

// Rota para criar um novo pedido
app.post('/orders', async (req, res) => {
  const newOrder = {
    id: orders.length + 1,
    customer: req.body.customer,
    products: req.body.products
  };
  orders.push(newOrder);

  // Enviar a mensagem para o RabbitMQ, notificando sobre o novo pedido
  try {
    const message = JSON.stringify(newOrder);
    channel.sendToQueue(QUEUE, Buffer.from(message));
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao enviar o pedido para o RabbitMQ', error: error.message });
  }
});

// Rota para editar um pedido existente
app.put('/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === parseInt(req.params.id));
  if (!order) return res.status(404).json({ message: 'Order not found' });

  order.customer = req.body.customer;
  order.products = req.body.products;
  res.json(order);
});

// Rota para excluir um pedido
app.delete('/orders/:id', (req, res) => {
  orders = orders.filter(o => o.id !== parseInt(req.params.id));
  res.status(204).send();
});

app.listen(3000, () => {
  console.log('Orders API rodando em http://localhost:3000');
  connectRabbitMQ();
});