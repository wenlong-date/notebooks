// 增（新增后添加到数组前面然后刷新日记）删（伪删除）改（改了后放到最前面）查（jquery mobile自带的查询功能）
// 还想增加的功能 能够定时到时候提醒
$(function() {
    // 定义一些公共的函数加载
    // noteTemp是主数据原始数据 noteData json格式化后的数据
    // 封装对note数据的方法
    var $list = $("#list");
    var noteTemp = window.localStorage.note ? JSON.parse(window.localStorage.note) : [];


    // 保存数据方法
    function saveNoteData() {
        window.localStorage.note = JSON.stringify(noteTemp);
    }
    // 1.加载（渲染）日记的函数(每次修改后)
    function loadNote() {
        if(window.localStorage.note){
            var note = JSON.parse(localStorage.note);
            $list.empty();
            var html = '';
            if(note.length > 0) {
                for(var i =0; i < note.length; i++){
                    // 只有delete标识为false的时候才显示出来
                    if(!note[i]['delete']){
                        html += '<li id=note' + i + ' data-id="'+ note[i]['id']+'"><a href="javascript:;" class="note"><h3 class="note-h">' + note[i]['title'] + '</h3><p class="note-c">' +
                            note[i]['content'] + '</p></a><a href="javascript:;" class="note-delete" data-icon="delete" >删除</a></li>';
                    }
                }
            }
            $list.append(html).listview('refresh');
        }
    }

    loadNote();


    // 2.增加备忘录
    $("#new").on("tap", function() {
        $.mobile.changePage("#addNote", {});
    });
    $("#addNote").on("pageshow", function() {
        $("#title").val("").focus();
        $("#inputMemo").val("");
    });
    $("#save").on("tap",saveNote);
    function saveNote() {
        var title = $("#title").val(),
            content = $("#inputMemo").val();
        if($.trim(title) == '') {
            $("#title").focus();
            return false;
        }
        if($.trim(content) == '') {
            $("#inputMemo").focus();
            return false;
        }
        var time = +new Date();

        noteTemp.unshift({
            id: noteTemp.length,
            title: title,
            content: content,
            delete: false,
            time: time
        });
        $(".ui-dialog").dialog("close");
        saveNoteData();
        loadNote();
        // 每次修改后显示未同步
        $("#syncWilddog").removeClass("ui-icon-check").addClass("ui-icon-cloud");
    }

    // 4.查看并能修改
    var editId ;
    $("#list").on("tap", ".note", function() {
        var title = $(this).find(".note-h").text(),
            content = $(this).find(".note-c").text();
        editId = $(this).parent("li").attr("id").slice(4);
        var time = new Date(noteTemp[editId].time);
        $.mobile.changePage("#editNote", {});
        $('#editNote').on('pageshow', function() {
            $(".edit-head").text(title);
            $('.edit-title').val(title);
            $('.edit-content').val(content);
            $(".edit-time").text(time);
        })
    });

    $(".edit-save").on("tap", function() {
        var title = $(".edit-title").val(),
            content = $(".edit-content").val();
        if($.trim(title) == '') {
            $(".edit-title").focus();
            return false;
        }
        if($.trim(content) == '') {
            $(".edit-content").focus();
            return false;
        }
        var time = +new Date();
        var changeTemp = noteTemp.splice(editId,1)[0]; // 这里返回的是一个数组
        changeTemp.title = title;
        changeTemp.content = content;
        changeTemp.time = time;
        noteTemp.unshift(changeTemp);
        $(".ui-dialog").dialog("close");
        saveNoteData();
        loadNote();
        $("#syncWilddog").removeClass("ui-icon-check").addClass("ui-icon-cloud");
        return false;
    })

    // 3.删除备忘录
    $("#list").on("tap", ".note-delete", function() {
        if (confirm('确定要删除吗？')) {
            var id = $(this).parent('li').attr('id').slice(4);
            deleteNote(id);
        }
        $("#syncWilddog").removeClass("ui-icon-check").addClass("ui-icon-cloud");
        return false; // need to return false; else triggle twice
    });

    // 伪删除数组里面的数据 刷新页面
    function deleteNote(id) {
        noteTemp[id].delete = true;
        saveNoteData();
        loadNote();
    }

    // 同步到野狗的key-value服务上
    $("#syncWilddog").on("tap", function() {
        var config = {
            syncDomain: "wenlong.wilddog.com",
            syncURL: "https://wenlong.wilddogio.com"
        };
        wilddog.initializeApp(config);
        var ref = wilddog.sync().ref("notes-public");
        ref.set(noteTemp, function(error) {
            if(error == null) {
                $("#syncWilddog").removeClass("ui-icon-cloud").addClass("ui-icon-check");
            }
        });
    });

});
