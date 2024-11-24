const express = require('express');
const amqp = require('amqplib');

const app = express();
app.use(express.json());

let products = [
  { id: 1, name: 'Product 1', price: 100 },
  { id: 2, name: 'Product 2', price: 200 }
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

  // Listen for messages
  channel.consume(
    'product_requests',
    msg => {
      const { productId } = JSON.parse(msg.content.toString());
      const product = products.find(p => p.id === productId);

      const response = product
        ? JSON.stringify(product)
        : JSON.stringify({ error: 'Product not found' });

      channel.sendToQueue(msg.properties.replyTo, Buffer.from(response), {
        correlationId: msg.properties.correlationId
      });

      channel.ack(msg);
    },
    { noAck: false }
  );
}
connectRabbitMQ();

app.get('/products', (req, res) => {
  res.json(products);
});

app.post('/products', (req, res) => {
  const newProduct = {
    id: products.length + 1,
    name: req.body.name,
    price: req.body.price
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.put('/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ message: 'Product not found' });

  product.name = req.body.name;
  product.price = req.body.price;
  res.json(product);
});

app.delete('/products/:id', (req, res) => {
  products = products.filter(p => p.id !== parseInt(req.params.id));
  res.status(204).send();
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Products API running on http://localhost:${PORT}`);
});