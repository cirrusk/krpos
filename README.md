한국암웨이 POS
===================

## POS 화면구성


- 헤더 : 공통화면(상단 POS명, 근무시작, 화면 잠금/풀림)
- 메인 : 대시보드, 장바구니, 고객화면 

> 액션 처리 : Modal 팝업(레이어 팝업), 데이터 인풋, 아웃풋 처리, 키이벤트 처리

> 경고 처리 : Alert 팝업, 단순 팝업으로 엔터 키 이벤트 팝업 닫힘, 타이머 처리로 자동 닫힘

> 진행 상황 : Spinner 팝업, 진행상황 표기용 팝업, HttpClient interceptor 에서 자동 처리, 그외에는 수동으로 열고 닫아야함.


  

## 개발 프로그램 설치
|프로그램이름 |목적 |링크 |
|---------------------|--------------------------|-----------------------------|
|Visual Studio Code |IDE |[링크](https://code.visualstudio.com) |
|Node.js |Package / Server |[링크](https://nodejs.org/ko) |
|Gitbub for Windows |Git 클라이언트 |[링크](https://central.github.com/deployments/desktop/desktop/latest/win32)|

  

## 영수증 프린터
|프로그램이름 |링크 |
|---------------------------|-------------------------|
|Sewoo POS Printer Driver |[링크](http://www.miniprinter.com/file/download.do?SEQ=531) |
|OPOS Driver |[링크](http://www.miniprinter.com/file/download.do?SEQ=565) |
  

## QZ Tray
|프로그램이름 |링크 |
|---------------------------|-------------------------|
|QZ Tray |[링크](https://github.com/qzind/tray/releases/download/v2.0.5/qz-tray-2.0.5.exe) |
  

## NICE 단말
- 제공받은 **POSToCATSetup.zip** 을 다운받아 설치합니다.
트레이의 **NICE 아이콘**을 확인합니다.
> `나이스 단말기`가 POS와 연결되어 있고 통신이 정상적으로 이루어져야 트레이에 정상적으로 loading 됩니다.


![Alt text](http://www.amway.co.kr/lcl/ko/AmwayLocalizedImages/PresetImages/logo_amway_ko.png  "amway")