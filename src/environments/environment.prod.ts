export const environment = {
  production: true,
  qzDebugMode: false,

  hybrisEndpointDomain: 'www.abnkorea.co.kr',
  hybrisEndpointPort: 80,

  // pos configurations
  baseSiteId: 'amwaykorea',
  apiRootUrl: 'https://127.0.0.1:9002/amwaycommercewebservices/v2',
  apiUrl: {
      terminal: '/{baseSiteId}/auth/terminal',
      auth: '/{baseSiteId}/auth/authorize',
      token: 'https://127.0.0.1:9002/authorizationserver/oauth/token',
      batchStart: '/{baseSiteId}/users/{user_id}/orderbatches',
      batchStop: '/{baseSiteId}/orderbatches/{batch_id}',
      createCart: '/{baseSiteId}/accounts/{accountId}/users/{userId}/carts',
      addToCart: '/{baseSiteId}/users/{userId}/carts/{cartId}/entries',
      updateVolAcc: '/{baseSiteId}/users/{userId}/carts/{cartId}/volumeaccount',
      getCart: '/{baseSiteId}/terminal/{macAddress}/carts',
      saveCart: '/{baseSiteId}/accounts/{accountId}/users/{userId}/cashier/{cashierId}/terminal/{macAddress}/carts/{cartId}/save',
      restoreCart: '/{baseSiteId}/users/{userId}/carts/{cartId}/restoresavedcart',
      deleteItemCart: '/{baseSiteId}/users/{userId}/carts/{cartId}/entries/{entryNumber}',
      deleteCart: '/{baseSiteId}/users/{userId}/carts/{cartId}',
      productSearch: '/{baseSiteId}/products/search'
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
