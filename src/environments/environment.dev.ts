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
  apiRootUrl: 'https://oms-dev.abnkorea.co.kr/amwaycommercewebservices/v2/',
  apiUrl: {
      terminal: 'https://oms-dev.abnkorea.co.kr/amwaycommercewebservices/v2/{baseSiteId}/auth/terminal',
      auth: 'https://oms-dev.abnkorea.co.kr/amwaycommercewebservices/v2/{baseSiteId}/auth/authorize',
      token: 'https://oms-dev.abnkorea.co.kr/authorizationserver/oauth/token',
      batchStart: 'https://oms-dev.abnkorea.co.kr/amwaycommercewebservices/v2/{baseSiteId}/users/{user_id}/orderbatches',
      batchStop: 'https://127.0.0.1:9002/amwaycommercewebservices/v2/{baseSiteId}/orderbatches/{batch_id}',
      createCart: 'https://oms-dev.abnkorea.co.kr/amwaycommercewebservices/v2/{baseSiteId}/accounts/{accountId}/users/{userId}/carts',
      addToCart: 'https://oms-dev.abnkorea.co.kr/amwaycommercewebservices/v2/{baseSiteId}/users/{userId}/carts/{cartId}/entries',
      updateVolAcc: 'https://oms-dev.abnkorea.co.kr/amwaycommercewebservices/v2/{baseSiteId}/users/{userId}/carts/{cartId}/volumeaccount',
      deleteItemCart: 'https://oms-dev.abnkorea.co.kr/amwaycommercewebservices/v2/{baseSiteId}/users/{userId}/carts/{cartId}/entries/{entryNumber}',
      productSearch: 'https://oms-dev.abnkorea.co.kr/amwaycommercewebservices/v2/{baseSiteId}/products/search'
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
