# 작업: 로딩 화면 수정

## 프로젝트 경로
`/Users/k/Documents/home/AI_Orchestration/multi-agent-system/workspace/project/agent-dashboard/`

## 요구사항

로딩 화면을 다음과 같이 수정:

1. **텍스트 제거**: 모든 로딩 텍스트 제거
2. **이모지 제거**: 로딩 로고 이모지 제거
3. **배경색 변경**: 검정색 (#000000)으로 변경
4. **GIF 이미지 사용**: `/assets/loading.gif` 이미지를 중앙에 표시

## 수정할 파일
1. `index.html` - 로딩 화면 HTML 구조 수정
2. `css/style.css` - 로딩 화면 스타일 수정

## 현재 로딩 화면 구조 (index.html)
```html
<div class="loading-screen" id="loading-screen">
    <div class="loading-logo">🤖</div>
    <div class="loading-spinner-container">
        <div class="loading-spinner"></div>
        <div class="loading-text">터미널 연결 중...</div>
    </div>
</div>
```

## 변경 후 구조
```html
<div class="loading-screen" id="loading-screen">
    <img src="/assets/loading.gif" alt="Loading" class="loading-gif">
</div>
```

## CSS 변경 사항
- `.loading-screen` 배경색을 #000000으로 변경
- `.loading-gif` 스타일 추가 (중앙 정렬, 적절한 크기)
- 기존 `.loading-logo`, `.loading-spinner`, `.loading-text` 스타일은 제거하거나 유지 (선택)

## 완료 시그널
```bash
touch /Users/k/Documents/home/AI_Orchestration/multi-agent-system/workspace/signals/dev-loading-done
```
