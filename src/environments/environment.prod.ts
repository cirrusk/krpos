export const environment = {
  production: true,
  qzDebugMode: false,

  hybrisEndpointDomain: 'www.abnkorea.co.kr',
  hybrisEndpointPort: 80,

  // pos configurations
  baseSiteId: 'amwaykorea',
  apiRootUrl: 'https://127.0.0.1:9002/amwaycommercewebservices/v2/',
  apiUrl: {
      terminal: 'https://127.0.0.1:9002/amwaycommercewebservices/v2/{baseSiteId}/auth/terminal',
      auth: 'https://127.0.0.1:9002/amwaycommercewebservices/v2/{baseSiteId}/auth/authorize',
      token: 'https://127.0.0.1:9002/authorizationserver/oauth/token',
      batchStart: 'https://127.0.0.1:9002/amwaycommercewebservices/v2/{baseSiteId}/users/{user_id}/orderbatches',
      batchStop: 'https://127.0.0.1:9002/amwaycommercewebservices/v2//{baseSiteId}/orderbatches/{batch_id}',
      createCart: 'https://127.0.0.1:9002/amwaycommercewebservices/v2/{baseSiteId}/accounts/{accountId}/users/{userId}/carts',
      addToCart: 'https://127.0.0.1:9002/amwaycommercewebservices/v2/{baseSiteId}/users/{userId}/carts/{cartId}/entries',
      updateVolAcc: 'https://127.0.0.1:9002/amwaycommercewebservices/v2/{baseSiteId}/users/{userId}/carts/{cartId}/volumeaccount',
      productSearch: 'https://127.0.0.1:9002/amwaycommercewebservices/v2/{baseSiteId}/products/search'
  },
  terminalApiUrl: 'https://127.0.0.1:9002/amwaycommercewebservices/v2/amwaykorea/auth/terminal',
  authApiUrl: 'https://127.0.0.1:9002/amwaycommercewebservices/v2/amwaykorea/auth/authorize',
  tokenApiUrl: 'https://127.0.0.1:9002/authorizationserver/oauth/token',
  logLevel: 'debug',
  qzCheck: false,
  healthCheckUse: false,
  healthCheckInterval: 9000,
  hybrisCheckUrl: 'https://127.0.0.1:9002/amwaycommercewebservices/'

};
