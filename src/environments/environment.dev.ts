// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  qzDebugMode: false,

  hybrisEndpointDomain: 'www.abnkorea.co.kr',
  hybrisEndpointPort: 80,

  // 임시 - 추후 삭제
  occEndpointDomain: '',

  receitPolicyFile: '/assets/template/receipt/policy/receipt.json',

  // pos configurations
  baseSiteId: 'amwaykorea',
  apiRootUrl: 'https://oms-dev.abnkorea.co.kr/amwaycommercewebservices/v2',
  apiUrl: {
      terminal: '/{baseSiteId}/auth/terminal',
      auth: '/{baseSiteId}/auth/authorize',
      token: 'https://oms-dev.abnkorea.co.kr/authorizationserver/oauth/token',
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
  terminalApiUrl: 'https://oms-dev.abnkorea.co.kr/amwaycommercewebservices/v2/amwaykorea/auth/terminal',
  authApiUrl: 'https://oms-dev.abnkorea.co.kr/amwaycommercewebservices/v2/amwaykorea/auth/authorize',
  tokenApiUrl: 'https://oms-dev.abnkorea.co.kr/authorizationserver/oauth/token',
  logLevel: 'debug',
  qzCheck: false,
  healthCheckUse: false,
  healthCheckInterval: 9000,
  hybrisCheckUrl: 'https://oms-dev.abnkorea.co.kr/amwaycommercewebservices/'

};
