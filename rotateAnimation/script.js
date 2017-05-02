function on(selector, event, func) {
    $("body").on(event, selector, func);
}

var app = {
    repeateImgAnimate: null,
    rotateAnimation: function(property) {
        $(property.selector).animate(property.css, {
            duration: property.duration,
            step: function(now, fx) {
                $(property.selector).css("-webkit-transform", "rotate("+ now +"deg)");
            }
        });
    },
    animateImg: function() {
        var dir = 1;
        var img1 = $("#all > div:first-child > span:first-child img");
        var img2 = $("#all > div:first-child > span:last-child img");
        
        if (app.repeateImgAnimate != null) return;
        app.repeateImgAnimate = setInterval(function() {
            dir = dir * -1;
            app.rotateAnimation({
                selector: img1,
                css: { rotate: dir*20 },
                duration: 700
            });
            
            app.rotateAnimation({
                selector: img2,
                css: { rotate: dir*(-20) },
                duration: 700
            });
        });
    },
    showDragZone: function() {
        $("#all").show();
        app.animateImg();
    },
    hideDragZone: function() {
        console.log("gd");
        $("#all").hide();
        clearInterval(app.repeateImgAnimate);
        app.repeateImgAnimate = null;
    },
    eventing: function() {
        $("body").on("drop drag dragenter dragover dragleave", function(e) { e.preventDefault();});
        $("body").on("dragenter", function() { app.showDragZone(); });
        $(".allBackground").on("dragleave", function() { app.hideDragZone(); });
    },
    init: function() {
        $("#all").hide();
        app.eventing();
    }
}

$(function() {
    app.init();
});