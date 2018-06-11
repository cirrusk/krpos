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

  phytoCafeUserId: '8000003',

  // pos configurations
  baseSiteId: 'amwaykorea',
  apiDomain: 'https://oms-dev.abnkorea.co.kr',
  apiRootUrl: 'https://oms-dev.abnkorea.co.kr/api/v2',
  apiUrl: {
    terminal: '/{baseSiteId}/auth/terminal',
    auth: '/{baseSiteId}/auth/authorize',
    token: 'https://oms-dev.abnkorea.co.kr/authorizationserver/oauth/token',
    userSearch: '/{baseSiteId}/accounts/Uid/{userId}',
    customerSearch: '/{baseSiteId}/customers/Uid/{userId}',
    batchStart: '/{baseSiteId}/users/{user_id}/orderbatches',
    batchStop: '/{baseSiteId}/orderbatches/{batch_id}',
    batchStats: '/{baseSiteId}/orderbatches/{batch_id}/statistics',
    batch: '/{baseSiteId}/orderbatches/currentBatch',
    createCart: '/{baseSiteId}/accounts/{accountId}/users/{userId}/carts',
    getCartList: '/{baseSiteId}/users/{userId}/carts/{cartId}',
    addToCart: '/{baseSiteId}/users/{userId}/carts/{cartId}/entries',
    updateItemQtyCart: '/{baseSiteId}/users/{userId}/carts/{cartId}/entries/{entryNumber}',
    updateVolAcc: '/{baseSiteId}/users/{userId}/carts/{cartId}/volumeaccount',
    getCart: '/{baseSiteId}/terminal/{macAddress}/carts',
    saveCart: '/{baseSiteId}/accounts/{accountId}/users/{userId}/cashier/{cashierId}/terminal/{macAddress}/carts/{cartId}/save',
    restoreCart: '/{baseSiteId}/users/{userId}/carts/{cartId}/restoresavedcart',
    deleteItemCart: '/{baseSiteId}/users/{userId}/carts/{cartId}/entries/{entryNumber}',
    deleteCart: '/{baseSiteId}/users/{userId}/carts/{cartId}',
    productSearch: '/{baseSiteId}/users/{userId}/carts/{cartId}/products/search',
    createNewAccount: '/{baseSiteId}/pos/accout/create',
    noticeList: '/{baseSiteId}/pos/notification/search',
    orderInfo: '/{baseSiteId}/orders',
    orderDetail: '/{baseSiteId}/orders/{code}',
    berSearch: '/{baseSiteId}/business/registration/{aboNum}',
    paymentModes: '/{baseSiteId}/stores/{storeId}/supportedPaymentModes',
    paymentModesByMainPayment: '/{baseSiteId}/users/{userId}/carts/{cartId}/supportedPaymentModes'
  },
  logLevel: 'debug',
  terminalTimeout: 20,
  qzCheck: false,
  healthCheckUse: false,
  healthCheckInterval: 9000,
  hybrisCheckUrl: 'https://oms-dev.abnkorea.co.kr/api/',
  cartListCount: 8,
  noticeInterval: 7,
  promotionInterval: 9
};
