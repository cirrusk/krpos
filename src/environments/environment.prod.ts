export const environment = {
  production: true,
  qzDebugMode: false,

  hybrisEndpointDomain: 'www.amway.co.kr',
  hybrisEndpointPort: 80,

  foreignerUserId: '8000000',
  memberUserId: '8000001',
  upChargeUserId: '8000002',
  phytoCafeUserId: '8000003',
  serviceUserId: '8000004',

  smallBagCode: '', // 비닐봉투 소 Product Code
  bigBagCode: '',   // 비닐봉투 대 Product Code

  // pos configurations
  baseSiteId: 'amwaykorea',
  apiDomain: 'https://api.amway.co.kr',
  // apiRootUrl: 'https://api.amway.co.kr/api/v2',
  apiRootUrl: 'https://hybris-kor-prod-occ.intranet.local/api/v2', // 암웨이 내부 시스템 OCC 호출
  apiUrl: {
    terminal: '/{baseSiteId}/auth/terminal',
    auth: '/{baseSiteId}/auth/authorize',
    // token: 'https://api.amway.co.kr/authorizationserver/oauth/token',
    token: 'https://hybris-kor-prod-occ.intranet.local/authorizationserver/oauth/token',
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
    productSearch: '/{baseSiteId}/products/search',
    productSearchByCart: '/{baseSiteId}/users/{userId}/carts/{cartId}/products/search',
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
    orderDetailsByOrderCodes: '/{baseSiteId}/order-details',
    createGroupCart: '/{baseSiteId}/users/{userId}/carts/{cartId}/groupcart',
    getGroupCart: '/{baseSiteId}/users/{userId}/carts/{cartId}/groupcart',
    getGroupOrder: '/{baseSiteId}/users/{userId}/orders/{orderId}/grouporder',
    orderCancel: '/{baseSiteId}/accounts/{accountId}/users/{userId}/cancel-order/{orderCode}',
    receipt: '/{baseSiteId}/users/{userId}/receipt/{orderCode}',
    cashdrawerLog: '/{baseSiteId}/point-of-service/cash-drawer-log/{batchId}',
    issueReceipt: '/{baseSiteId}/users/{userId}/issue-receipt/{orderCode}',
    cancelReceipt: '/{baseSiteId}/users/{userId}/cancel-receipt/{orderCode}',
    confirmPickup: '/{baseSiteId}/confirm-pickup/{pickupStore}',
    checkBlock: '/{baseSiteId}/check-order-block/{userId}',
    getFavoriteProducts: '/{baseSiteId}/point-of-service/popular-products/{pickupStore}'
  },
  logLevel: 'error', // 로그레벨 설정
  terminalTimeout: 10, // 터미널 인증 타임아웃(sec)
  directdebitTimeout: 60, // 자동이체 타임아웃(sec)
  qzCheck: false, // QZ Tray Health Check
  healthCheckUse: false, // Health Check 사용여부
  healthCheckInterval: 15, // Hybris Health Check 타임아웃(sec)
  hybrisCheckUrl: 'https://api.amway.co.kr/api/v2/swagger-ui.html', // Hybris Health Check URL
  cartListCount: 8, // 카트 목록 건수
  noticeInterval: 7, // 일반 공지사항 롤링 주기(sec)
  promotionInterval: 9, // 프로모션 공지사항 롤링 주기(sec)
  isMdmsSkip: false, // MDMS 체크 제외 여부
  installcheckPrice: 50000, // 할부 제한 금액
  creditcardMinPrice: 200, // 복합결제 시 주결제 방법 최소 금액 신용카드
  directdebitMinPrice: 1, // 복합결제 시 주결제 방법 최소 금액 자동이체

  // NICE 단말기 설정
  niceTermBase: 'ws://localhost',
  niceTermPort: '8088',
  niceTermType: 'PCAT'
};
