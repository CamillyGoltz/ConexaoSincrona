const express = require('express');
const axios = require('axios');
const app = express();
const port = 3002;

app.use(express.json());

let orders = [];

app.post('/orders', async (req, res) => {
  const order = req.body;

  // Consultar o contato na API de contatos
  try {
    const response = await axios.get(`http://localhost:3001/products/${order.contactId}`);
    if (response.status === 200) {
        order.id = orders.length + 1;
        orders.push(order);
      res.status(201).json(order);
    }
  } catch (error) {
    res.status(404).send('Contact not found');
  }
});

app.get('/orders', (req, res) => {
  res.json(orders);
});

app.get('/orders/:id', (req, res) => {
  const order = orders.find(m => m.id === parseInt(req.params.id));
  if (order) {
    res.json(order);
  } else {
    res.status(404).send('Order not found');
  }
});

app.put('/orders/:id', (req, res) => {
  const order = orders.find(m => m.id === parseInt(req.params.id));
  if (order) {
    Object.assign(order, req.body);
    res.json(order);
  } else {
    res.status(404).send('Orders not found');
  }
});

app.delete('/orders/:id', (req, res) => {
  const orderIndex = orders.findIndex(m => m.id === parseInt(req.params.id));
  if (orderIndex !== -1) {
    orders.splice(orderIndex, 1);
    res.status(204).send();
  } else {
    res.status(404).send('Orders not found');
  }
});

app.listen(port, () => {
  console.log(`Orders API running on http://localhost:${port}`);
});
