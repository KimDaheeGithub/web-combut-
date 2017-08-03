$(function() {
	if(localStorage.getItem("editor") != null) app.dir.dirs = JSON.parse(localStorage.getItem("editor"));
	if(localStorage.getItem("path") != null) app.currentPath = localStorage.getItem("path").split("/");
	if(localStorage.getItem("tab") != null) app.tab.openedTab = JSON.parse(localStorage.getItem("tab"));
	$(app.tab.openedTab).each(function(e, el) { app.tab.open(el); });
	
	app.dir.sync();
	app.init();
});

var app = {
	dir: {
		maxIdx: 0,
		dirs: [],
		sync: function() {
			if(app.dir.dirs.length > 0) app.dir.maxIdx = app.dir.dirs[app.dir.dirs.length - 1].idx;
			$("aside > ul > li:not(.title)").remove();
			
			if(app.currentPath.length > 1) $(".folderList").append('<li data-idx="-1"><span><svg><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"></path></svg></span><a href="#">..</a></li>');
			
			$(app.dir.dirs).each(function(e, el) {
				if(el.path != app.showPath()) return;
				
				var html = "";
				html += '<li data-idx="'+el.idx+'">';
				html += '<span>';
				html += (el.type == "folder") ? '<svg><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"></path></svg>' : '<svg><path d="M12,0H4C2.896,0,2.01,0.896,2.01,2L2,18c0,1.104,0.886,2,1.99,2H16c1.104,0,2-0.896,2-2V6L12,0z M11,4H11  z M11,7V1.5L16.5,7H11z"></path></svg>';
				html += '</span>';
				html += '<a href="#">'+el.name+'</a>';
				html += '</li>';
				
				if(el.type == "folder") $(".folderList").append(html);
				else $(".fileList").append(html);
			});
			
			$(".dirPath").html("");
			var paths = app.currentPath.slice();
			paths.splice(0, 1);
			
			$(paths).each(function(e, el) {
				var data = "";
				data += "<div class='path'>";
				
				if(e < paths.length - 1) {
					data += "<div class='text prev'>"+el+"</div>";
					data += '<div class="right-btn"><svg><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg></div>';
				} else {
					data += "<div class='text'>"+el+"</div>";
				}
				
				data += "</div>";
				
				$(".dirPath").append(data);
			});
		},
		save: function() {
			var data = app.dir.dirs;
			data = JSON.stringify(data);
			localStorage.setItem("editor", data);
		},
		findFile: function(idx) {
			var returnValue;
			$(app.dir.dirs).each(function(e, el) {
				if(el.idx != idx) return;
				returnValue = el;
				return false;
			});
			
			return returnValue;
		},
		movePath: function(idx) {
			if(idx == "-1") {
				app.currentPath.pop();
			} else {
				var data = app.dir.findFile(idx);
				app.currentPath.push(data.name);
			}
			
			localStorage.setItem("path", app.currentPath.join("/"));
			app.dir.sync();
		},
		pathClick: function(text) {
			if(text == app.currentPath[app.currentPath.length - 1]) return;
			
			var data;
			
			$(app.dir.dirs).each(function(e, el) {
				if(el.name != text || el.type != "folder") return;
				data = JSON.parse(JSON.stringify(el));
				
				if(el.path.split("/").length < app.currentPath.length) data.idx = -1;
			});
			
			app.dir.movePath(data.idx);
		}
	},
	currentPath: [""],
	showPath: function() {
		var returnValue = "/";
		if(app.currentPath.length > 1) returnValue = app.currentPath.join("/");
		return returnValue;
	},
	create: {
		uploading: false,
		folder: function(popup) {
			app.create.creating({
				path: app.showPath(),
				name: $(popup).find("#folderName").val(),
				type: "folder"
			});
		},
		file: function(popup) {
			var ext = $(popup).find("#fileExt").val();
			app.create.creating({
				path: app.showPath(),
				name: $(popup).find("#fileName").val() + "." + ext,
				ext: ext,
				type: "file"
			});
		},
		image: function(popup) {
			$(app.create.currentImage).each(function(e, el) {
				sameNameCheck = app.create.sameNameCheck(el.name);
				if(sameNameCheck != null) {
					alert("같은 파일명의 이미지는 업로드할 수 없습니다.");
					return false;
				}

				if(app.create.currentImage.length - 1 == e) {
					app.create.uploading = true;
					$(app.create.currentImage).each(function(e2, el2) {
						app.create.creating({
							path: app.showPath(),
							name: el2.name,
							ext: el2.type,
							value: el2.value,
							type: "file"
						});

						if(app.create.currentImage.length - 1 == e2 && app.create.uploading == true) {
							setTimeout(function() {
								app.create.uploading = false;
								alert("업로드가 완료되었습니다.");
							}, 3000);
						}
					});
				}
			});
		},
		currentImage: [],
		imageNameCheck: function(name) {
			var returnValue = true;
			
			$(".uploadFileList > li").each(function(e, el) {
				if($(el).text().trim() == name) {
					returnValue = false;
				}
			});
			
			return returnValue;
		},
		loadImage: function(files) {
			var cnt = 0;
			
			$(files).each(function(e, el) {
				var imageNameCheck = app.create.imageNameCheck(el.name.trim());	
				if(imageNameCheck != true) return;
				
				var reader = new FileReader();
				reader.readAsDataURL(el);
				reader.onload = function(e) {
					el.value = e.target.result;
					$(".uploadFileList").append("<li>"+el.name+"</li>");
					app.create.currentImage.push(el);
				}
				
				cnt++;
			});
			
			if(cnt != files.length) alert("기존에 추가 된 파일과 동일한 파일명을 가진 파일을 제외하고 업로드 됩니다.");
			$("#imageName").val("");
		},
		creating: function(data) {
			var sameNameCheck = app.create.sameNameCheck(data.name);
			
			if(sameNameCheck != null) {
				alert(sameNameCheck);
				onHidePopup();
				return false;
			}
			
			if(!data.value) data.value = null;
			if(!data.ext) data.ext = null;
			
			data.idx = app.dir.maxIdx + 1;
			app.dir.dirs.push(data);
			app.dir.save();
			onHidePopup();
			app.dir.sync();
		},
		sameNameCheck: function(name) {
			var returnValue = null;
			
			if(name.substr(0, 1) == ".") returnValue = "폴더나 파일 생성 시 이름은 '.'으로 시작할 수 없습니다.";
			else if(name.substr(0, 1) == " ") returnValue = "폴더나 파일 생성 시 이름은 공백으로 시작할 수 없습니다.";
			
			$(app.dir.dirs).each(function(e, el) {
				if(el.name == name) returnValue = "같은 이름의 폴더나 파일을 생성할 수 없습니다.";
			});
			
			return returnValue;
		}
	},
	tab: {
		openedTab: [],
		saveTab: function() {
			localStorage.setItem("tab", JSON.stringify(app.tab.openedTab));
		},
		open: function(idx) {
			var data = app.dir.findFile(idx);
			var tab = "";
			
			if(data.value == null) data.value = "";
			
			tab += '<div data-idx="'+data.idx+'">';
			tab += '<span class="editor-text">'+data.name+'</span>';
			tab += '<span class="editor-close">&times;</span>';
			tab += '</div>';
			
			$(".editor-tab").append(tab);
			
			if(data.ext.match(/^image/) != null) $(".editorWindow").append("<img class='code' data-idx='"+data.idx+"' src='"+data.value+"'>");
			else $(".editorWindow").append("<textarea class='code' data-idx='"+data.idx+"'>"+data.value+"</textarea>");
			
			app.tab.view(idx);
		},
		view: function(idx) {
			$(".code").hide();
			$(".code[data-idx='"+idx+"']").show();
			app.tab.saveTab();
		},
		close: function(idx) {
			var closeKey;
			
			$(app.tab.openedTab).each(function(e, el) {
				if(idx != el) return;
				closeKey = e;
				return false;
			});
			
			app.tab.openedTab.splice(closeKey, 1);
			
			$(".code[data-idx='"+idx+"']").remove();
			$(".editor-tab > div[data-idx='"+idx+"']").remove();
			
			if(app.tab.openedTab.length > 0) {
				app.tab.view(app.tab.openedTab[0]);
			}
			
			app.tab.saveTab();
		}
	},
	hotKey: {
		save: function(code) {
			var idx = $(code).attr("data-idx");
			
			$(app.dir.dirs).each(function(e, el) {
				if(el.idx != idx) return;
				el.value = $(code).val();
			});
			
			app.dir.save();
		},
		close: function(code) {
			var idx = $(code).attr("data-idx");
			var data = app.dir.findFile(idx);
			
			if(data.ext.match(/^image/) == null) {
				if(data.value != $(code).val()) {
					if(confirm("작성 중인 파일이 저장되지 않았습니다. 저장하시겠습니까?") == true) app.hotKey.save(code);
				}
			}
			
			app.tab.close(idx);
		},
		insertTab: function(textarea) {
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
	},
	init: function() {
		app.dir.sync();
		
		on("#createFolder", "click", function() { app.create.folder($(this).parents(".popup")); });
		on("#createFile", "click", function() { app.create.file($(this).parents(".popup")); });
		on("#createImage", "click", function() { app.create.image($(this).parents(".popup")); });
		
		on("#imageBox", "drop drag dragenter dragover", function(e) { e.preventDefault(); });
		on("#imageBox", "drop", function(e) { app.create.loadImage(e.originalEvent.dataTransfer.files); });
		on("#imageName", "change", function(e) { app.create.loadImage(this.files); });
		
		on(".folderList > li:not(.title)", "dblclick", function() { app.dir.movePath($(this).attr("data-idx")); });
		on(".fileList > li:not(.title)", "dblclick", function() {
			var idx = $(this).attr("data-idx");
			app.tab.openedTab.push(idx);
			app.tab.open(idx);
		});
		
		on(".editor-tab > div", "click", function() { app.tab.view($(this).attr("data-idx")); });
		on(".editor-close", "click", function(e) {
			e.stopPropagation();
			
			var idx = $(this).parent("div").attr("data-idx");
			$(app.dir.dirs).each(function(e, el) {
				if(el.idx != idx) return;
				if(el.ext.match(/^image/) != null) app.tab.close(idx);
				else app.hotKey.close($(".code[data-idx='"+idx+"']"));
			});
		});
		
		on("textarea.code", "keydown", function(e) {
            if(e.ctrlKey && e.which == 83) {
                e.preventDefault();
				app.hotKey.save(this);
            }
            if(e.ctrlKey && e.which == 88) {
                e.preventDefault();
				app.hotKey.close(this);
            }
            if(e.which == 9) {
                e.preventDefault();
				app.hotKey.insertTab(this);
            }
		});
		
		on(".path .text", "click", function() { app.dir.pathClick($(this).text().trim()); });
	}
}

function on(selector, event, func) {
	$("body").on(event, selector, func);
}

$(".btn-wrap .btn").on("click", function(e){
	if(app.create.uploading == true) {
		alert("업로드 중에는 버튼을 사용할 수 없습니다.");
		return false;
	}
	
    var id = $(this).attr("data-popup");
	$(id).find(".paths").val(app.showPath());
    onShowPopup(id);
});

$(".popup-close").on("click", function(){
    var id = "#" + $(this).parents(".popup").attr("id");
    onHidePopup(id);
});

function onShowPopup ( id ) {
	app.create.currentImage = [];
    $(".popup-background").fadeIn();
    $(id).fadeIn();
}

function onHidePopup ( id ) {
    $(".popup-background").fadeOut();
	
	if(!id) $(".popup").fadeOut();
	else $(id).fadeOut();
	
	$(".popup #folderPath, .popup #folderName, .popup #filePath, .popup #fileName, .popup #imagePath").val("");
	$(".popup #fileExt").val("html");
	$(".uploadFileList > li").remove();
	
}

$(".editor-tab div").on("click", function(){
    $(this).addClass("this").siblings().removeClass("this");
});