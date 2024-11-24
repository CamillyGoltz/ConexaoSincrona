const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

let orders = [
  { id: 1, customer: 'Cliente 1', products: [1, 2] },
  { id: 2, customer: 'Cliente 2', products: [2] }
];

app.post('/rpc', async (req, res) => {
  const { jsonrpc, method, params, id } = req.body;

  if (jsonrpc !== '2.0') {
    return res.json({ jsonrpc: '2.0', error: { code: -32600, message: 'Invalid JSON-RPC version' }, id });
  }

  try {
    switch (method) {
      case 'getAllOrders':
        res.json({ jsonrpc: '2.0', result: orders, id });
        break;

      case 'getOrderById':
        const order = orders.find(o => o.id === parseInt(params.id));
        if (!order) return res.json({ jsonrpc: '2.0', error: { code: -32602, message: 'Order not found!' }, id });

        const productDetails = await Promise.all(
          order.products.map(productId => axios.get(`http://localhost:3001/rpc`, {
            method: 'POST',
            data: {
              jsonrpc: '2.0',
              method: 'getProductById',
              params: { id: productId },
              id: 1
            }
          }))
        );
        const products = productDetails.map(response => response.data.result);
        res.json({ jsonrpc: '2.0', result: { ...order, products }, id });
        break;

      case 'createOrder':
        const newOrder = {
          id: orders.length + 1,
          customer: params.customer,
          products: params.products
        };
        orders.push(newOrder);
        res.json({ jsonrpc: '2.0', result: newOrder, id });
        break;

      case 'updateOrder':
        const orderToUpdate = orders.find(o => o.id === parseInt(params.id));
        if (!orderToUpdate) return res.json({ jsonrpc: '2.0', error: { code: -32602, message: 'Order not found!' }, id });

        orderToUpdate.customer = params.customer;
        orderToUpdate.products = params.products;
        res.json({ jsonrpc: '2.0', result: orderToUpdate, id });
        break;

      case 'deleteOrder':
        orders = orders.filter(o => o.id !== parseInt(params.id));
        res.json({ jsonrpc: '2.0', result: 'Order deleted!', id });
        break;

      default:
        res.json({ jsonrpc: '2.0', error: { code: -32601, message: 'method not found!' }, id });
    }
  } catch (error) {
    res.json({ jsonrpc: '2.0', error: { code: -32603, message: 'Internal error', data: error.message }, id });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Order JSON-RPC API running on http://localhost:${PORT}`);
});

// Listar pedidos:
// {
//     "jsonrpc": "2.0",
//     "method": "getAllOrders",
//     "id": 1
// }

// Listar pedido por ID:
// {
//     "jsonrpc": "2.0",
//     "method": "getOrderById",
//     "params": { "id": 1 },
//     "id": 2
// }

// Criar pedido:
// {
//     "jsonrpc": "2.0",
//     "method": "createOrder",
//     "params": {
//       "customer": "Cliente Novo",
//       "products": [1, 2]
//     },
//     "id": 3
// }

// Editar pedido:
// {
//     "jsonrpc": "2.0",
//     "method": "updateOrder",
//     "params": {
//       "id": 1,
//       "customer": "Cliente Atualizado",
//       "products": [2, 3]
//     },
//     "id": 4
// }

// Excluir pedido:
// {
//     "jsonrpc": "2.0",
//     "method": "deleteOrder",
//     "params": { "id": 1 },
//     "id": 5
// }