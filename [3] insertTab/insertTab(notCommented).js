$(function() {
	on("#code", "keydown", function(e) {
		if(e.which == 9) {
			e.preventDefault();
			insertTab(this);
		}
	});
});

function on(selector, event, func) {
	$("body").on(event, selector, func);
}

function insertTab(textarea) {
	var start = textarea.selectionStart;
	var end = textarea.selectionEnd;
	var returnValue = $(textarea).val();
	var pos = [0,0];
	
	if(start == end) {
		returnValue = returnValue.slice(0, start)+"\t"+returnValue.slice(start);
		pos = [start+1, start+1];
	} else {
		var cursorStart = start, cursorEnd = end;
		pos[0] = cursorStart;
		pos[1] = cursorEnd;
		
		returnValue = returnValue.split("\n");
		
		$(returnValue).each(function(e, el) {
			if(el.length - cursorStart < 0) {
				cursorStart -= el.length;
			} else {
				cursorStart = e;
				return false;
			}
		});
		
		pos[0] += 1;

		$(returnValue).each(function(e, el) {
			if(el.length - cursorEnd < 0) {
				cursorEnd -= (el.length + 1);
			} else {
				cursorEnd = e;
				return false;
			}
		});
		
		pos[1] += (cursorEnd - cursorStart + 1);

		for(var i=cursorStart; i<=cursorEnd; i++) {
			returnValue[i] = "\t"+returnValue[i];
		}
	
		returnValue = returnValue.join("\n");
	}
	
	$(textarea).val(returnValue);
	textarea.setSelectionRange(pos[0],pos[1]);
}