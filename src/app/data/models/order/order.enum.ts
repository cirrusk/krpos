/**
 * 주문 유형
 *  - 일반, 그룹
 */
export enum OrderType {
    NORMAL = 'N',
    GROUP = 'G'
}

/**
 * 조회 유형
 *  - 계정, 상품
 */
export enum SearchMode {
    ACCOUNT = 'A',
    PRODUCT = 'P'
}

/**
 * 장바구니 유형
 *  - POS(일반), POSGROUP(그룹)
 */
export enum CartType {
    POS = 'POS',
    POSGROUP = 'POSGROUP'
}

/**
 * 모델 유형
 *  - ACCOUNT(계정) = 'A',PRODUCT(상품)) = 'P', CART(장바구니) = 'C', GROUP(그룹) = 'G'
 */
export enum ModelType {
    ACCOUNT = 'A',
    PRODUCT = 'P',
    CART = 'C',
    GROUP = 'G'
}

/**
 * 검색시 사용자 유형
 *  - ABO = 'A', MEMBER = 'M', CONSUMER = 'C'
 */
export enum SearchMemberType {
    ABO = 'A',
    MEMBER = 'M',
    CONSUMER = 'C'
}

/**
 * 비회원 등록 타입
 *  - EASY_PICKUP : 간편선물
 */
export enum ConsumerRegister {
    CONSUMER = 'CONSUMER',
    EASY_PICKUP = 'EASY_PICKUP'
}
