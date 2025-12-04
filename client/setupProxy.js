const { createProxyMiddleware } = require('http-proxy-middleware');

console.log('Loading setupProxy.js'); // Add logging to see if this file is being loaded

module.exports = function(app) {
  console.log('Setting up proxy middleware'); // Add logging to see if this function is being called
  
  app.use(
    '/users',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  );
  
  app.use(
    '/products',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  );
  
  app.use(
    '/recommendations',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  );
  
  app.use(
    '/cart',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  );
  
  app.use(
    '/orders',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  );
  
  app.use(
    '/admin',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  );
  
  app.use(
    '/upload',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  );
  
  app.use(
    '/payment',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  );
  
  console.log('Proxy middleware setup complete'); // Add logging to see if setup is complete
};