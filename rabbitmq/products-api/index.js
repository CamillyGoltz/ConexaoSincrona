const express = require('express');
const amqp = require('amqplib');
const app = express();

app.use(express.json());

let productsList = [
  { id: 1, name: 'Product 1', price: 10.0 },
  { id: 2, name: 'Product 2', price: 7.5 }
];

let channel, connection;
const QUEUE = 'orderQueue';

async function connectRabbitMQ() {
  try {
    connection = await amqp.connect('amqp://localhost');
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE);
    console.log('Products API connected to RabbitMQ');
  } catch (error) {
    console.error('Error in RabbitMQ connection:', error);
  }
}

async function processOrder(msg) {
  const order = JSON.parse(msg.content.toString());
  console.log('Order received:', order);

  const orderDetails = order.products.map(productId => {
    const product = productsList.find(p => p.id === productId);
    return product ? product : { message: `Product ${productId} not found` };
  });

  console.log('Order details:', orderDetails);

  channel.ack(msg);
}

async function consumeOrders() {
  channel.consume(QUEUE, processOrder, { noAck: false });
}

app.get('/Products/GetAll', (req, res) => {
  res.json(productsList);
});

app.get('/Products/GetById/:id', (req, res) => {
  const product = productsList.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

app.post('/Products/Create', (req, res) => {
  const newProduct = {
    id: productsList.length + 1,
    name: req.body.name,
    price: req.body.price
  };
  productsList.push(newProduct);
  res.status(201).json(newProduct);
});

app.put('/Products/Update/:id', (req, res) => {
  const product = productsList.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ message: 'Product not found' });

  product.name = req.body.name;
  product.price = req.body.price;
  res.json(product);
});

app.delete('/Products/Delete/:id', (req, res) => {
  products = productsList.filter(p => p.id !== parseInt(req.params.id));
  res.status(204).send();
});

app.listen(3001, () => {
  console.log('Products API running in http://localhost:3001');
  connectRabbitMQ().then(consumeOrders);
});
