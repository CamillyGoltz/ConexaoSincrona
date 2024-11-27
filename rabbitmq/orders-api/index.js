const express = require('express');
const axios = require('axios');
const amqp = require('amqplib');
const app = express();

app.use(express.json());

let ordersList = [
  { id: 1, customer: 'Customer 1', productsId: [1, 2] },
  { id: 2, customer: 'Customer 2', productsId: [2] }
];

let channel, connection;
const QUEUE = 'orderQueue';

async function connectRabbitMQ() {
  try {
    connection = await amqp.connect('amqp://localhost');
    channel = await connection.createChannel();

    await channel.assertQueue(QUEUE);
    console.log('Orders API connected to RabbitMQ');
  } catch (error) {
    console.error('Error in RabbitMQ connection:', error);
  }
}

app.post('/Orders/Create', async (req, res) => {
  const newOrder = {
    id: ordersList.length + 1,
    customer: req.body.customer,
    productsId: req.body.products
  };

  ordersList.push(newOrder);

  try {
    const message = JSON.stringify(newOrder);

    channel.sendToQueue(QUEUE, Buffer.from(message));
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error while trying to send order to RabbitMQ', error: error.message });
  }
});

app.get('/Orders/GetAll', (req, res) => {
  res.json(ordersList);
});

app.get('/Orders/GetById/:id', async (req, res) => {
  const order = ordersList.find(o => o.id === parseInt(req.params.id));

  if (!order) return res.status(404).json({ message: 'Order not found' });

  try {
    const productDetails = await Promise.all(
      order.productsId.map(productId => axios.get(`http://localhost:3005/Products/GetById/${productId}`))
    );
    const products = productDetails.map(response => response.data);

    res.json({ ...order, products });
  } catch (error) {
    res.status(500).json({ message: 'Error getting products', error: error.message });
  }
});

app.put('/Orders/Update/:id', (req, res) => {
  const order = ordersList.find(o => o.id === parseInt(req.params.id));

  if (!order) return res.status(404).json({ message: 'Order not found' });

  order.customer = req.body.customer;
  order.productsId = req.body.products;

  res.json(order);
});

app.delete('/Orders/Delete/:id', (req, res) => {
  orders = ordersList.filter(o => o.id !== parseInt(req.params.id));

  res.status(204).send();
});

const PORT = 3004;

app.listen(PORT, () => {
  console.log(`Orders API running on http://localhost:${PORT}`);
  connectRabbitMQ();
});