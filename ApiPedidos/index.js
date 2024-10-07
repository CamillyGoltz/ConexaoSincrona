const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

let orders = [
  { id: 1, customer: 'Cliente 1', products: [1, 2] },
  { id: 2, customer: 'Cliente 2', products: [2] }
];

app.get('/pedidos', (req, res) => {
  res.json(orders);
});

app.get('/pedidos/:id', async (req, res) => {
  const order = orders.find(o => o.id === parseInt(req.params.id));
  if (!order) return res.status(404).json({ message: 'Pedido não encontrado' });

  try {
    const productDetails = await Promise.all(
      order.products.map(productId => axios.get(`http://localhost:3001/produtos/${productId}`))
    );
    const products = productDetails.map(response => response.data);
    res.json({ ...order, products });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar os produtos', error: error.message });
  }
});

app.post('/pedidos', (req, res) => {
  const newOrder = {
    id: orders.length + 1,
    customer: req.body.customer,
    products: req.body.products
  };
  orders.push(newOrder);
  res.status(201).json(newOrder);
});

app.put('/pedidos/:id', (req, res) => {
  const order = orders.find(o => o.id === parseInt(req.params.id));
  if (!order) return res.status(404).json({ message: 'Pedido não encontrado' });

  order.customer = req.body.customer;
  order.products = req.body.products;
  res.json(order);
});

app.delete('/pedidos/:id', (req, res) => {
  orders = orders.filter(o => o.id !== parseInt(req.params.id));
  res.status(204).send();
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API de Pedidos rodando em http://localhost:${PORT}`);
});