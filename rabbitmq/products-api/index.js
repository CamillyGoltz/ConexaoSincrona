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

// Função para processar pedidos
async function processOrder(msg) {
  const order = JSON.parse(msg.content.toString());
  console.log('Pedido recebido:', order);

  // Aqui você pode adicionar a lógica de processamento dos produtos
  const orderDetails = order.products.map(productId => {
    const product = products.find(p => p.id === productId);
    return product ? product : { message: `Produto ${productId} não encontrado` };
  });

  console.log('Detalhes do Pedido:', orderDetails);

  // Após o processamento, confirme que a mensagem foi tratada
  channel.ack(msg);
}

async function consumeOrders() {
  channel.consume(QUEUE, processOrder, { noAck: false });
}

app.listen(3001, () => {
  console.log('Products API rodando em http://localhost:3001');
  connectRabbitMQ().then(consumeOrders);
});