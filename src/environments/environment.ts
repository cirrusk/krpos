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
  apiRootUrl: 'https://127.0.0.1:9002/amwaycommercewebservices/v2/',
  apiUrl: {
      terminal: this.apiRootUrl + '{baseSiteId}/auth/terminal',
      auth: this.apiRootUrl + '{baseSiteId}/auth/authorize',
      token: 'https://127.0.0.1:9002/authorizationserver/oauth/token',
      batchStart: this.apiRootUrl + '{baseSiteId}/users/{user_id}/orderbatches',
      batchStop: this.apiRootUrl + '/{baseSiteId}/orderbatches/{batch_id}',
      createCart: this.apiRootUrl + '{baseSiteId}/accounts/{accountId}/users/{userId}/carts',
      addToCart: this.apiRootUrl + '{baseSiteId}/users/{userId}/carts/{cartId}/entries',
      updateVolAcc: this.apiRootUrl + '{baseSiteId}/users/{userId}/carts/{cartId}/volumeaccount',
      deleteItemCart: this.apiRootUrl + '{baseSiteId}/users/{userId}/carts/{cartId}/entries/{entryNumber}'

  },
  terminalApiUrl: this.apiRootUrl + 'amwaykorea/auth/terminal',
  authApiUrl: this.apiRootUrl + 'amwaykorea/auth/authorize',
  tokenApiUrl: 'https://127.0.0.1:9002/authorizationserver/oauth/token',
  logLevel: 'debug',
  qzCheck: false,
  healthCheckUse: false,
  healthCheckInterval: 9000,
  hybrisCheckUrl: 'https://127.0.0.1:9002/amwaycommercewebservices/'

};
