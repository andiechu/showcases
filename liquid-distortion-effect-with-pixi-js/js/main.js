(function() {

    window.CanvasSlideshow = function(options) {
        var that = this;
        
        // -- displacement map
      
        let renderer           = new PIXI.autoDetectRenderer({
            width: options.width || window.innerWidth,
            height: options.height || window.innerHeight,
            antialias: options.antialias,
            autoResize: true
        });
        let stage              = new PIXI.Container();
        let slidesContainer    = new PIXI.Container();
        let displacementSprite = new PIXI.Sprite.fromImage(options.displacementImage);
        let displacementFilter = new PIXI.filters.DisplacementFilter(displacementSprite);
        
        displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;

        // add canvas to HTML
        document.body.appendChild(renderer.view);

        // add child container to the stage
        stage.addChild(slidesContainer);

        // set the filter to the stage
        stage.filters = [displacementFilter];
        stage.addChild(displacementSprite);

        // Load the sprites to the slides container, and position them at the center of the stage
        // The sprite array is passed to the component upon its initialization
        // If the slide has text, add it as a child to the image and center it
        this.loadPixiSprites = function(sprites) { 
            for (let i = 0; i < sprites.length; i++) {
                let texture = new PIXI.Texture.fromImage(sprites[i]);
                let image   = new PIXI.Sprite(texture);

                if (options.texts) {
                    let textStyle = new PIXI.TextStyle({
                        fill: "#ffffff",
                        wordWrap: true,
                        wordWrapWidth: 400
                    });

                    let text = new PIXI.Text(options.texts[i], textStyle);
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

        this.currentIndex = 0;
        let slidesImages = slidesContainer.children;
        let isPlaying = false;

        for (let i = 0; i < options.nav.length; i++) {
            let navItem = options.nav[i];

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
        
        this.resize = function() {
            options.width = window.innerWidth;
            options.height = window.innerHeight;
            renderer.resize(options.width, options.height);
            
        }


        // -- render the scene and add some default animation

        // use PIXI's Ticker class to render the scene (similar to requestAnimationFrame)
        var ticker = new PIXI.ticker.Ticker();
        ticker.autoStart = true;
        ticker.add(function(delta) {
            // Optionally have a default animation
            displacementSprite.x += 10 * delta;
            displacementSprite.y += 3;

            // Render our stage
            that.resize();
            renderer.render(stage);
        });
        
        this.init = function() {
            that.loadPixiSprites(options.sprites);
        };
        
        that.init();
    };
    
})();