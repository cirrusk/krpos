// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  qzDebugMode: false,

  hybrisEndpointDomain: 'qa.amway.co.kr',
  hybrisEndpointPort: 80,

  foreignerUserId: '8000000',
  memberUserId: '8000001',
  upChargeUserId: '8000002',
  phytoCafeUserId: '8000003',
  serviceUserId: '8000004',

  // 임시 - 추후 삭제
  occEndpointDomain: '',

  receitPolicyFile: '/assets/template/receipt/policy/receipt.json',

  // pos configurations
  baseSiteId: 'amwaykorea',
  apiDomain: 'https://api.qa.amway.co.kr',
  apiRootUrl: 'https://api.qa.amway.co.kr/api/v2',
  apiUrl: {
    terminal: '/{baseSiteId}/auth/terminal',
    auth: '/{baseSiteId}/auth/authorize',
    token: 'https://api.qa.amway.co.kr/authorizationserver/oauth/token',
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
    getSaveCart: '/{baseSiteId}/terminal/{macAddress}/carts',
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
    paymentModesByMain: '/{baseSiteId}/users/{userId}/carts/{cartId}/supportedPaymentModes',
    intallmentPlan: '/{baseSiteId}/installmentPlan',
    balance: '/{baseSiteId}/users/{userId}/balance',
    recash: '/{baseSiteId}/users/{userId}/recash',
    searchCoupons: '/{baseSiteId}/accounts/{accountId}/users/{userId}/coupons',
    searchCoupon: '/{baseSiteId}/accounts/{accountId}/users/{userId}/coupon',
    applyCoupon: '/{baseSiteId}/users/{userId}/carts/{cartId}/vouchers',
    placeOrder: '/{baseSiteId}/users/{userId}/carts/{cartId}/paymentCaptureAndPlaceOrder',
    searchCheque: '/{baseSiteId}/validateCheckNumber',
    orderList: '/{baseSiteId}/order/search',
    orderDetails: '/{baseSiteId}/users/{userId}/order-details',
    createGroupCart: '/{baseSiteId}/users/{userId}/carts/{cartId}/groupcart',
    getGroupCart: '/{baseSiteId}/users/{userId}/carts/{cartId}/groupcart',
    orderCancel: '/{baseSiteId}/accounts/{accountId}/users/{userId}/cancel-order/{orderCode}'
  },
  logLevel: 'info',
  terminalTimeout: 20,
  directdebitTimeout: 60,
  qzCheck: false,
  healthCheckUse: false,
  healthCheckInterval: 9000,
  hybrisCheckUrl: 'https://api.qa.amway.co.kr/api/',
  cartListCount: 8,
  noticeInterval: 7,
  promotionInterval: 9,

  // NICE 단말기 설정
  niceTermBase: 'ws://localhost',
  niceTermPort: '8088',
  niceTermType: 'PCAT'
};
