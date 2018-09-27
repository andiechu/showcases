$(document).ready(function() {
    
    let cols = [];
    let rows = [];
    
    function getRandomInt(min, max) {
        return Math.floor(Math.random()*(max - min) + min);
    }
    
    let createTile = function(element, col, row) {
        let tileEl = element.get();

        let bgNumStr = ("000" + getRandomInt(0, 60)).slice(-2);
        let frontNumStr = ("000" + getRandomInt(1, 31)).slice(-2);
        
        let bgTransStr = "";
        if (getRandomInt(0, 10) == 1) {
            bgTransStr += "rotate(" + Math.random()*180 + "deg)";
        }
        
        
        element.css("background-image", "url('/images/bg-" + bgNumStr +".png')").css("background-size", getRandomInt(20, 60) + "%").css("transform", bgTransStr).css("-webkit-transform", bgTransStr);
                
        if(getRandomInt(0, 10) == 1) {
            let frontTransStr = "";
            frontTransStr += "translate(" + getRandomInt(-100, 100) + "px, " + getRandomInt(-100, 100) + "px) scale(" + Math.random() + ") rotate(" + Math.random()*90 + "deg)";
            
            let picEl = $(document.createElement("div"));
            picEl.addClass("pic");
            element.append(picEl);
            picEl.css("background-image", "url('/images/front-" + frontNumStr +".svg')").css("transform", frontTransStr).css("-webkit-transform", frontTransStr);
            
        }
                
        cols.push(col);
        rows.push(row);
    }
    
    // #wall is the infinite wall.
    // The wall is made of tiles 100px wide and 100px high.
    var infinitedrag = jQuery.infinitedrag("#wall", {}, {
        width: 200,
        height: 200,
        start_col: 0,
        start_row: 0,
        oncreate: createTile
    });

});



