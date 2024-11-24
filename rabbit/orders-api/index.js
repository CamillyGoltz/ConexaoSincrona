const express = require('express');
const amqp = require('amqplib');

const app = express();
app.use(express.json());

let orders = [
  { id: 1, customer: 'Cliente 1', products: [1, 2] },
  { id: 2, customer: 'Cliente 2', products: [2] }
];

// RabbitMQ setup
const RABBITMQ_URL = 'amqp://localhost';
let channel, connection;

// Connect to RabbitMQ
async function connectRabbitMQ() {
  connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertQueue('product_requests');
  await channel.assertQueue('product_responses');
}
connectRabbitMQ();

app.get('/orders', (req, res) => {
  res.json(orders);
});

app.get('/orders/:id', async (req, res) => {
  const order = orders.find(o => o.id === parseInt(req.params.id));
  if (!order) return res.status(404).json({ message: 'Order not found' });

  try {
    const productDetails = await Promise.all(
      order.products.map(productId => getProductDetails(productId))
    );
    res.json({ ...order, products: productDetails });
  } catch (error) {
    res.status(500).json({ message: 'Error getting products', error: error.message });
  }
});

// Request product details via RabbitMQ
async function getProductDetails(productId) {
  return new Promise((resolve, reject) => {
    const correlationId = generateCorrelationId();

    channel.sendToQueue('product_requests', Buffer.from(JSON.stringify({ productId })), {
      correlationId,
      replyTo: 'product_responses'
    });

    // Listen for the response
    channel.consume(
      'product_responses',
      msg => {
        if (msg.properties.correlationId === correlationId) {
          resolve(JSON.parse(msg.content.toString()));
          channel.ack(msg);
        }
      },
      { noAck: false }
    );
  });
}

function generateCorrelationId() {
  return Math.random().toString() + Date.now();
}

app.post('/orders', (req, res) => {
  const newOrder = {
    id: orders.length + 1,
    customer: req.body.customer,
    products: req.body.products
  };
  orders.push(newOrder);
  res.status(201).json(newOrder);
});

app.put('/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === parseInt(req.params.id));
  if (!order) return res.status(404).json({ message: 'Order not found' });

  order.customer = req.body.customer;
  order.products = req.body.products;
  res.json(order);
});

app.delete('/orders/:id', (req, res) => {
  orders = orders.filter(o => o.id !== parseInt(req.params.id));
  res.status(204).send();
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Orders API running on http://localhost:${PORT}`);
});