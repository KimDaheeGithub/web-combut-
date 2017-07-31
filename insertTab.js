/*

코드를 보기 전에
1. .selectionStart
2. .selectionEnd
3. .setSelectionRange()

에 대해서 알고 확인하길 바람.

*/

// document ready
$(function() {
	// #code : 코드 입력하는 textarea
	/* #code에서 코드 작성 중 만약 tab키(ASKII: 9)를 누르면
		preventDefault 시키고 insertTab를 호출
		이때 파라미터는 this(#code) */
	on("#code", "keydown", function(e) {
		if(e.which == 9) {
			e.preventDefault();
			insertTab(this);
		}
	});
});

// on event
function on(selector, event, func) {
	$("body").on(event, selector, func);
}

// 탭 키를 눌렀을 때 호출 될 함수
// 전달받은 this(#code)는 textarea 변수로 받음
function insertTab(textarea) {
	// start = 커서의 시작 위치
	var start = textarea.selectionStart;
	// end = 커서의 끝 위치
	var end = textarea.selectionEnd;
	// returnValue = 최종적으로 탭이 입력 된 값을 저장할 변수
	var returnValue = $(textarea).val();
	// 탭이 삽입되고 난 후의 커서 위치(pos[0]: 시작 위치, pos[1]: 끝 위치)
	var pos = [0,0];
	
	/* 시작위치와 끝 위치가 같은 경우
	(드래그하여 범위를 지정한 것이 아니라 한 부분에다가 커서를 둔 경우) */
	if(start == end) {
		// returnValue는 커서가 위치한 곳에 탭(\t)을 삽입
		returnValue = returnValue.slice(0, start)+"\t"+returnValue.slice(start);
		// 최종 커서 위치는 pos[0], pos[1] 모두 시작점+1 (1은 탭을 한 글자로 인식하기 때문)
		pos = [start+1, start+1];
	} else {
	/* 시작위치가 끝 위치가 다른 경우
	(드래그하여 범위를 지정한 경우) */
		/* 기존의 start, end 값을 변경시키지 않기 위해 새로운 start, end 변수들을 생성
		이 때 cursorStart와 cursorEnd는 물론 커서의 위치를 뜻하지만
		다음 코드에서는 커서의 위치보다는 글자 수의 개념으로 인식하는 것이 편하다. */
		var cursorStart = start, cursorEnd = end;
		// 일단 pos에 커서의 시작점과 끝점을 세이브해둠
		pos[0] = cursorStart;
		pos[1] = cursorEnd;
		// returnValue를 개행문자(\n) 기준으로 자름
		returnValue = returnValue.split("\n");
		// line 수 만큼 반복
		$(returnValue).each(function(e, el) {
			/* 루프를 돌면서 시작위치의 글자 수가 분명 각 라인의 글자 수보다
			초과할 것이기 때문에 초과하는 경우는 cursorStart에서 라인의 글자 수를 빼는 과정을 거친다.*/
			if(el.length - cursorStart < 0) {
				cursorStart -= el.length;
			} else {
			/* 최종적으로 cursorStart가 초과되지 않는 상태가 비로소 커서의 시작점이 몇 line에 위치하는지를 뜻한다.
			마지막으로 cursorStart에 루프 횟수 e를 저장한다.*/
				cursorStart = e;
				// 시작점을 알아낸 후에는 루프를 정지
				return false;
			}
		});
		
		// 시작점에 +1(tab 글자 수)
		pos[0] += 1;

		// 위와 마찬가지로 커서의 끝 위치를 알아내기 위하여 반복문을 돈다.
		$(returnValue).each(function(e, el) {
			if(el.length - cursorEnd < 0) {
			/* 시작 위치를 알아내는 조건과는 일치하지만 실행식은 조금 다르다.
			각 행마다 tab 기호가 들어가므로 시작점과 달리 1씩을 더 빼주어야 커서의 위치가 정확해진다. */
				cursorEnd -= (el.length + 1);
			} else {
			// 커서의 시작 위치를 알아내는 방법과 동일
				cursorEnd = e;
				return false;
			}
		});

		/* 밑의 식은 개행문자 역시 글자 수 1을 차지 하기때문에
		지정한 범위의 라인 수 만큼 더해주는 과정임. */
		pos[1] += (cursorEnd - cursorStart + 1);

		/* 여기에서 cursorStart와 cursorEnd는 초기에 설정한 변수의 의미와는 달리
		위의 반복문을 통해 커서가 위치한 라인 위치를 뜻한다. */
		for(var i=cursorStart; i<=cursorEnd; i++) {
			// 지정한 범위에 해당하는 행의 시작마다 탭 기호를 삽입
			returnValue[i] = "\t"+returnValue[i];
		}
		
		// 개행문자로 조인
		returnValue = returnValue.join("\n");
	}
	
	$(textarea).val(returnValue);
	
	// 커서 위치 지정
	textarea.setSelectionRange(pos[0],pos[1]);
}