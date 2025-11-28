const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/users',
    createProxyMiddleware({
      target: 'https://nexus-ecommerce-api.onrender.com',
      changeOrigin: true,
      secure: true
    })
  );
  
  app.use(
    '/products',
    createProxyMiddleware({
      target: 'https://nexus-ecommerce-api.onrender.com',
      changeOrigin: true,
      secure: true
    })
  );
  
  app.use(
    '/orders',
    createProxyMiddleware({
      target: 'https://nexus-ecommerce-api.onrender.com',
      changeOrigin: true,
      secure: true
    })
  );
};