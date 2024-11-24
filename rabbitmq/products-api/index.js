const express = require('express');
const amqp = require('amqplib');
const app = express();

app.use(express.json());

let products = [
  { id: 1, name: 'Product 1', price: 100 },
  { id: 2, name: 'Product 2', price: 200 }
];

let channel, connection;
const QUEUE = 'pedidoQueue';

// Conectar ao RabbitMQ
async function connectRabbitMQ() {
  try {
    connection = await amqp.connect('amqp://localhost');
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE);
    console.log('Products API conectada ao RabbitMQ');
  } catch (error) {
    console.error('Erro ao conectar ao RabbitMQ:', error);
  }
}

// Função para processar pedidos recebidos via RabbitMQ
async function processOrder(msg) {
  const order = JSON.parse(msg.content.toString());
  console.log('Pedido recebido:', order);

  // Processar os produtos no pedido
  const orderDetails = order.products.map(productId => {
    const product = products.find(p => p.id === productId);
    return product ? product : { message: `Produto ${productId} não encontrado` };
  });

  console.log('Detalhes do Pedido:', orderDetails);

  // Após o processamento, confirmar a mensagem
  channel.ack(msg);
}

async function consumeOrders() {
  channel.consume(QUEUE, processOrder, { noAck: false });
}

// Rota para obter todos os produtos
app.get('/products', (req, res) => {
  res.json(products);
});

// Rota para obter um produto específico
app.get('/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

// Rota para criar um novo produto
app.post('/products', (req, res) => {
  const newProduct = {
    id: products.length + 1,
    name: req.body.name,
    price: req.body.price
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// Rota para editar um produto existente
app.put('/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ message: 'Product not found' });

  product.name = req.body.name;
  product.price = req.body.price;
  res.json(product);
});

// Rota para excluir um produto
app.delete('/products/:id', (req, res) => {
  products = products.filter(p => p.id !== parseInt(req.params.id));
  res.status(204).send();
});

app.listen(3001, () => {
  console.log('Products API rodando em http://localhost:3001');
  connectRabbitMQ().then(consumeOrders);
});