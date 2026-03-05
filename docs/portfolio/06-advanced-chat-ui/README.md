# 06. 고급 채팅 UI

> 양방향 무한 스크롤, 3D 명함 플립 애니메이션, @멘션 자동완성, 이모티콘 키보드 등 고도화된 UI 구현

## 핵심 가치

- 다양한 메시지 타입을 단일 컴포넌트로 렌더링
- 메시지 검색 후 해당 위치로 애니메이션 스크롤
- 키보드 높이 변화에 따른 동적 레이아웃 조정

---

## 채팅 화면 구조

```
ChatScreen
├─ ChatHeader (SelectHeader / SearchHeader)
│   ├─ 채팅방 이름, 멤버 수
│   └─ 검색 모드 전환
│
├─ ChatMessageView            ← 핵심 컴포넌트
│   ├─ FlatList (양방향 무한 스크롤)
│   ├─ 메시지 타입별 렌더러
│   │   ├─ TextMessage       (텍스트 + 멘션)
│   │   ├─ FileMessage       (파일 다운로드)
│   │   ├─ ImageMessage      (썸네일 + 뷰어)
│   │   ├─ EmoticonMessage   (GIF 이모티콘)
│   │   ├─ BizCardMessage    (명함 미리보기)
│   │   ├─ ReplyMessage      (인용 답장)
│   │   └─ LinkMessage       (링크 미리보기)
│   └─ DateSeparator         (날짜 구분선)
│
└─ ChatFooter
    ├─ TextKeyboard           (텍스트 입력 + 멘션)
    ├─ EmoticonKeyboard       (카테고리별 이모티콘)
    └─ AttachmentMenu         (파일/사진 첨부)
```

---

## 양방향 무한 스크롤

```
최초 진입: 최신 30개 로드
         │
    ──────┴───────
    ▼             ▼
위로 스크롤    아래로 스크롤
(이전 메시지)  (새 메시지 - 실시간으로 자동 추가)
    │
    ▼
prepend 방식으로 상단에 추가
(스크롤 위치 유지)
```

```typescript
// ChatMessageView.tsx

function ChatMessageView({ roomId }: Props) {
  const flatListRef = useRef<FlatList>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasPrev, setHasPrev] = useState(false);
  const [hasNext, setHasNext] = useState(false);

  // 위로 스크롤 시 이전 메시지 로드
  const onStartReached = useCallback(async () => {
    if (!hasPrev || isLoadingMore) return;

    const oldest = messages[0];
    const prevMessages = await chatRepository.takeBefore({
      roomId,
      beforeId: oldest.activeId,
      limit: 30,
    });

    // 스크롤 위치 보정 후 prepend
    setMessages((prev) => [...prevMessages, ...prev]);
    setHasPrev(prevMessages.length === 30);
  }, [hasPrev, messages]);

  // 검색 결과 클릭 시 해당 메시지로 점프
  const jumpToMessage = useCallback(async (messageId: string) => {
    const range = await chatRepository.takeRangeById({
      anchorId: messageId,
      beforeCount: 15,
      afterCount: 15,
      roomId,
    });

    setMessages(range);

    // 앵커 메시지 위치로 스크롤
    const anchorIndex = range.findIndex((m) => m.messageId === messageId);
    flatListRef.current?.scrollToIndex({ index: anchorIndex, animated: true });
  }, [roomId]);

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      inverted={!hasNext} // 최신 메시지가 아래에 있을 때
      onStartReachedThreshold={0.3}
      onStartReached={onStartReached}
      onEndReachedThreshold={0.3}
      onEndReached={onEndReached}
      keyExtractor={(item) => item.messageId ?? item.localId}
      renderItem={({ item }) => <MessageItem message={item} />}
    />
  );
}
```

---

## @멘션 자동완성

```typescript
// MentionUserList.tsx

function MentionUserList({ query, onSelect }: Props) {
  const { data: members } = useQuery({
    queryKey: [GET_MEMBER_LIST, roomId],
    queryFn: () => memberRepository.getAll(roomId),
  });

  const filtered = useMemo(
    () => members?.filter((m) =>
      m.name.includes(query) || m.nickname?.includes(query)
    ) ?? [],
    [members, query]
  );

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <FlatList
        data={filtered}
        renderItem={({ item }) => (
          <MemberItem member={item} onPress={() => onSelect(item)} />
        )}
        keyboardShouldPersistTaps="handled"
      />
    </Animated.View>
  );
}

// TextKeyboard.tsx — @ 입력 감지
const handleTextChange = (text: string) => {
  const mentionMatch = text.match(/@(\S*)$/);
  if (mentionMatch) {
    setMentionQuery(mentionMatch[1]);
    setShowMentionList(true);
  } else {
    setShowMentionList(false);
  }
};
```

---

## 이모티콘 키보드

```typescript
// EmoticonKeyboard.tsx

// 카테고리 탭 + 이모티콘 그리드
// 수평 스크롤로 카테고리 탭과 이모티콘 목록 동기화

function EmoticonKeyboard({ onSelect }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const [activeCategory, setActiveCategory] = useState(0);

  const onCategoryPress = (index: number) => {
    setActiveCategory(index);
    // 해당 카테고리로 스크롤 이동
    scrollRef.current?.scrollTo({
      y: index * CATEGORY_HEIGHT,
      animated: true,
    });
  };

  return (
    <View style={styles.container}>
      {/* 카테고리 탭 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((cat, idx) => (
          <CategoryTab
            key={cat.id}
            category={cat}
            isActive={activeCategory === idx}
            onPress={() => onCategoryPress(idx)}
          />
        ))}
      </ScrollView>

      {/* 이모티콘 그리드 */}
      <ScrollView ref={scrollRef}>
        {categories.map((cat) => (
          <EmoticonGrid
            key={cat.id}
            emoticons={cat.items}
            onSelect={onSelect}
          />
        ))}
      </ScrollView>
    </View>
  );
}
```

---

## 3D 명함 플립 애니메이션

```typescript
// BizCardEditScreen.tsx — React Native Reanimated

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withTiming,
} from 'react-native-reanimated';

function BizCardPreview() {
  const spin = useSharedValue(0); // 0 = 앞면, 1 = 뒷면

  // 앞면 스타일
  const frontStyle = useAnimatedStyle(() => ({
    transform: [{
      rotateY: `${interpolate(spin.value, [0, 1], [0, 180], Extrapolation.CLAMP)}deg`,
    }],
    backfaceVisibility: 'hidden',
  }));

  // 뒷면 스타일 (180도 미리 회전)
  const backStyle = useAnimatedStyle(() => ({
    transform: [{
      rotateY: `${interpolate(spin.value, [0, 1], [180, 360], Extrapolation.CLAMP)}deg`,
    }],
    backfaceVisibility: 'hidden',
    position: 'absolute',
  }));

  const flip = () => {
    spin.value = withTiming(spin.value === 0 ? 1 : 0, { duration: 500 });
  };

  return (
    <Pressable onPress={flip}>
      {/* 앞면 */}
      <Animated.View style={[styles.card, frontStyle]}>
        <BizCardFront />
      </Animated.View>
      {/* 뒷면 */}
      <Animated.View style={[styles.card, backStyle]}>
        <BizCardBack />
      </Animated.View>
    </Pressable>
  );
}
```

---

## 키보드 높이 대응

```typescript
// react-native-keyboard-controller 활용

import { useKeyboardHandler } from 'react-native-keyboard-controller';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';

function ChatFooter() {
  const keyboardHeight = useSharedValue(0);

  useKeyboardHandler({
    onMove: (e) => {
      'worklet';
      keyboardHeight.value = e.height;
    },
  });

  const containerStyle = useAnimatedStyle(() => ({
    paddingBottom: keyboardHeight.value,
  }));

  return (
    <Animated.View style={[styles.footer, containerStyle]}>
      {/* 입력 영역 */}
    </Animated.View>
  );
}
```

---

## 메시지 타입 목록

| 타입 | 설명 |
|------|------|
| `CHAT` | 텍스트 메시지 (멘션 포함) |
| `REPLY` | 인용 답장 |
| `FILE` | 파일 첨부 |
| `IMAGE` | 이미지 (썸네일 + 뷰어) |
| `EMOTICON` | GIF 이모티콘 |
| `BIZCARD` | 명함 공유 |
| `LINK` | 링크 미리보기 |
| `SYSTEM` | 시스템 메시지 (멤버 입퇴장 등) |
| `VOICE` | 음성 메시지 |

---

## 이력서 포인트

> **"React Native FlatList 기반 양방향 무한 스크롤 구현 (위/아래 양방향 + 검색 결과 점프).
> React Native Reanimated로 3D 명함 플립 애니메이션 구현 (backfaceVisibility + interpolate).
> @멘션 자동완성, 30+ 카테고리 이모티콘 키보드, 9가지 메시지 타입 렌더링."**

---

## 관련 파일

| 파일 | 설명 |
|------|------|
| `src/screens/chat/ChatScreen.tsx` | 채팅 화면 메인 |
| `src/screens/chat/ChatMessageView.tsx` | 메시지 목록 + 무한 스크롤 |
| `src/screens/chat/ChatFooter.tsx` | 입력 영역 |
| `src/screens/chat/components/EmoticonKeyboard.tsx` | 이모티콘 키보드 |
| `src/screens/chat/components/MentionUserList.tsx` | 멘션 자동완성 |
| `src/screens/chat/components/TextKeyboard.tsx` | 텍스트 입력 + 멘션 감지 |
| `src/navigation/app/bizCard/BizCardEditScreen.tsx` | 3D 플립 + 명함 편집 |

---

## 스크린샷 / 다이어그램

<!-- 실제 앱 스크린샷을 아래에 추가하세요 -->

| 채팅 화면 | 이모티콘 키보드 | 명함 플립 |
|-----------|---------------|----------|
| <!-- ![Chat](./images/chat-screen.png) --> | <!-- ![Emoticon](./images/emoticon-keyboard.png) --> | <!-- ![BizCard](./images/bizcard-flip.gif) --> |

> 📌 `images/` 폴더에 실제 앱 스크린샷이나 GIF를 추가하세요.
