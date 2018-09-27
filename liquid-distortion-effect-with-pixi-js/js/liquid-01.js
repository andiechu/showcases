// -- GET GOING!

var spriteImages = document.querySelectorAll(".slider-item__image"); 
var spriteImageSrc = [];
var texts = [];

for (let i = 0; i < spriteImages.length; i++) {
    let img = spriteImages[i];
    
    if (img.nextElementSibling) {
        texts.push(img.nextElementSibling.innerHTML);
    } else {
        text.push("");
    }
    
    spriteImageSrc.push(img.getAttribute("src"));
}

// initialize the slide show

//let displacementImage = "../images/dmaps/2048x2048/clouds.jpg";
//let sprites = spriteImageSrc;
//let nav = document.querySelectorAll(".nav-btn");

var initCanvasSlideshow = new CanvasSlideshow({
    sprites: spriteImageSrc,
    texts: texts,
    displacementImage: "../images/dmaps/2048x2048/clouds.jpg",
    autoPlay: true,
    autoPlaySpeed: [10, 3],
    displayScale: [200, 70],
    fullScreen: true,
    navElement: document.querySelectorAll(".nav-btn"),
    displaeAutoFit: false
});


// -- displacement map

let renderer           = new PIXI.autoDetectRenderer();
let stage              = new PIXI.Container();
let slidesContainer    = new PIXI.Container();
let displacementSprite = new PIXI.Sprite.fromImage(displacementImage);
let displacementFilter = new PIXI.filters.DisplacementFilter(displacementSprite);

// add canvas to HTML
document.body.appendChild(renderer.view);

// add child container to the stage
stage.addChild(slidesContainer);

// set the filter to the stage
stage.filters = [displacementFilter];

// Load the sprites to the slides container, and position them at the center of the stage
// The sprite array is passed to the component upon its initialization
// If the slide has text, add it as a child to the image and center it
function loadPixiSprites(sprites) { 
    for (let i = 0; i < sprites.length; i++) {
        let texture = new PIXI.Texture.fromImage(sprites[i]);
        let image   = new PIXI.Sprite(texture);
        
        if (texts) {
            let textStyle = new PIXI.TextStyle({
                fill: "#ffffff",
                wordWrap: true,
                wordWrapWidth: 400
            });
            
            let text = new PIXI.Text(texts[i], textStyle);
            image.addChild(text);
            
            text.anchor.set(0.5);
            text.x = image.width / 2;
            text.y = image.height / 2;
        }
        
        image.anchor.set(0.5);
        image.x = renderer.width / 2;
        image.y = renderer.height / 2;
        
        slidesContainer.addChild(image);
    }  
}


// -- manipulating page slider

let currentIndex = 0;
let slidesImages = slidesContainer.children;
let isPlaying = false;

for (let i = 0; i < nav.length; i++) {
    let navItem = nav[i];
    
    navItem.addEventListener("click", function(event) {
        if (isPlaying) {
            return false;
        }
        
        if (this.getAttribute('data-nav') == 'next') {
            if (that.currentIndex >= 0 && that.currentIndex < slidesImages.length - 1) {
                moveSlider(currentIndex + 1);
            } else {
                moveSlider(0);
            }
        } else {
            if (that.currentIndex > 0 && that.currentIndex < slidesImages.length) {
                moveSlider(currentIndex - 1);
            } else {
                moveSlider(slidesImages.length - 1);
            }
        }
        
        return false;
    });
}

function moveSlider(newIndex) {
    isPlaying = true;
    
    let baseTimeline = new TimelineMax({
        onComplete: function() {
            that.currentIndex = newIndex;
            isPlaying = false;
        }
    });
    
    baseTimeline
        .to(displacementFilter.scale, 1, {x: 200, y: 200})
        .to(slidesImages[that.currentIndex], 0.5, {alpha: 0})
        .to(slidesImages[newIndex], 0.5, {alpha: 1})
        .to(displacementFilter.scale, 1, {x: 20, y: 20})
}


// -- render the scene and add some default animation

// use PIXI's Ticker class to render the scene (similar to requestAnimationFrame)
var ticker = new PIXI.ticker.Ticker();
ticker.add(function(delta) {
    // Optionally have a default animation
    displacementSprite.x += 10 * delta;
    displacementSprite.y += 3 * delta;
    
    // Render our stage
    renderer.render(stage);
});








