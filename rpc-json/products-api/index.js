const express = require('express');
const app = express();

app.use(express.json());

let products = [
  { id: 1, name: 'Produto 1', price: 100 },
  { id: 2, name: 'Produto 2', price: 200 }
];

app.post('/rpc', (req, res) => {
  const { jsonrpc, method, params, id } = req.body;

  if (jsonrpc !== '2.0') {
    return res.json({ jsonrpc: '2.0', error: { code: -32600, message: 'Invalid JSON-RPC version' }, id });
  }

  switch (method) {
    case 'getAllProducts':
      res.json({ jsonrpc: '2.0', result: products, id });
      break;

    case 'getProductById':
      const product = products.find(p => p.id === parseInt(params.id));
      if (!product) return res.json({ jsonrpc: '2.0', error: { code: -32602, message: 'Product not found' }, id });
      res.json({ jsonrpc: '2.0', result: product, id });
      break;

    case 'createProduct':
      const newProduct = {
        id: products.length + 1,
        name: params.name,
        price: params.price
      };
      products.push(newProduct);
      res.json({ jsonrpc: '2.0', result: newProduct, id });
      break;

    case 'updateProduct':
      const productToUpdate = products.find(p => p.id === parseInt(params.id));
      if (!productToUpdate) return res.json({ jsonrpc: '2.0', error: { code: -32602, message: 'Product not found' }, id });

      productToUpdate.name = params.name;
      productToUpdate.price = params.price;
      res.json({ jsonrpc: '2.0', result: productToUpdate, id });
      break;

    case 'deleteProduct':
      products = products.filter(p => p.id !== parseInt(params.id));
      res.json({ jsonrpc: '2.0', result: 'Produto deletado', id });
      break;

    default:
      res.json({ jsonrpc: '2.0', error: { code: -32601, message: 'Method not found' }, id });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Products JSON-RPC API running on http://localhost:${PORT}`);
});

// Listar produtos:
// {
//   "jsonrpc": "2.0",
//   "method": "getAllProducts",
//   "id": 6
// }

// Listar produto por ID:
// {
//   "jsonrpc": "2.0",
//   "method": "getProductById",
//   "params": { "id": 1 },
//   "id": 7
// }

// Criar produto:
// {
//   "jsonrpc": "2.0",
//   "method": "createProduct",
//   "params": {
//     "name": "Produto Novo",
//     "price": 150
//   },
//   "id": 8
// }

// Editar produto:
// {
//   "jsonrpc": "2.0",
//   "method": "updateProduct",
//   "params": {
//     "id": 1,
//     "name": "Produto Atualizado",
//     "price": 120
//   },
//   "id": 9
// }

// Excluir produto:
// {
//   "jsonrpc": "2.0",
//   "method": "deleteProduct",
//   "params": { "id": 1 },
//   "id": 10
// }