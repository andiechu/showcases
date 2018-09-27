(function() {
    window.CanvasSlideshow = function(options) {
        
        // SCOPE
        var that = this;
        
        
        // OPTIONS
        options = options || {};
        options.stageWidth = options.hasOwnProperty('stageWidth') ? options.stageWidth : window.innerWidth;
        options.stageHeight = options.hasOwnProperty('stageHeight') ? options.stageHeight : window.innerHeight;
        options.interactive = options.hasOwnProperty('interactive') ? options.interactive : false;
        options.fullScreen = options.hasOwnProperty('fullScreen') ? options.fullScreen : false;
        options.resolution = options.hasOwnProperty('resolution') ? options.resolution : window.devicePixelRatio;
        options.autoPlay = options.hasOwnProperty('autoPlay') ? options.autoPlay : true;
        options.autoPlaySpeed = options.hasOwnProperty('autoPlaySpeed') ? options.autoPlaySpeed : [10, 3];
        options.wacky = options.hasOwnProperty('wacky') ? options.wacky : false;
        options.displacementAutoFit = options.hasOwnProperty('displacementAutoFit') ? options.displacementAutoFit : false;
        options.displacementCenter = options.hasOwnProperty('displacementCenter') ? options.displacementCenter : true;
        options.displaceScale = options.hasOwnProperty('displaceScale') ? options.displaceScale : [200, 70];
        options.displaceScaleTo = (options.autoPlay === false) ? [ 0, 0 ] : [ 20, 20 ];
        options.centerSprites = options.hasOwnProperty('centerSprites') ? options.centerSprites : true;
        options.pixiSprites = options.hasOwnProperty('sprites') ? options.sprites : [];
        options.texts = options.hasOwnProperty('texts') ? options.texts : [];
        options.textColor = options.hasOwnProperty('textColor') ? options.textColor : '#fff';
        options.navElement = options.hasOwnProperty('nav')  ?  options.nav : document.querySelectorAll('.nav-btn'); 
        options.slideBtnElement = options.hasOwnProperty('slideBtnElement')  ?  options.slideBtnElement : document.querySelectorAll('.slider-btn-item'); 
        options.loaderElement = options.hasOwnProperty('loader')  ?  options.loader : document.querySelector('.loader'); 

        
        // TEXT STYLE
        var style = new PIXI.TextStyle({
            fill: options.textColor,
            wordWrap: true,
            wordWrapWidth: 400,
            letterSpacing: 10,
            fontSize: 24
        });
        
        
        // UTILS
        var imgScale = 1.0;
        var resizeImage = function(img) {
            if (img.hasOwnProperty('originWidth') && img.hasOwnProperty('originHeight')) {
                let imgRatio = img.originWidth / img.originHeight;
                if (renderer.screen.width/renderer.screen.height > imgRatio) {
                    imgScale = renderer.screen.width/img.originWidth;
                } else {
                    imgScale = renderer.screen.height/img.originHeight;
                }
            }
            img.scale.set(imgScale);
        }
        
        
        function scaleToWindow(canvas, backgroundColor) {
            renderer.resize(window.innerWidth, window.innerHeight);
            
            var images = slidesContainer.children;
            
            // resize image
            for (let i in images) {
                let img = images[i];
                img.x = renderer.screen.width / 2;
                img.y = renderer.screen.height / 2;
                resizeImage(img);
                
                // resize text
                let texts = img.children;
                console.log(texts)
                for (let t in texts) {
                    texts[t].scale.set(1/imgScale);
                }
            }
            
        }
        
        
        this.currentIndex = 0;
        
        // PIXI
        var renderer = new PIXI.autoDetectRenderer(options.stageWidth, options.stageHeight, {transparent: true, resolution: options.resolution, autoResize: true});
        var stage = new PIXI.Container();
        var slidesContainer = new PIXI.Container();
        var displacementSprite = new PIXI.Sprite.fromImage(options.displacementImage);
        var displacementFilter = new PIXI.filters.DisplacementFilter(displacementSprite);
        
        var loader = new PIXI.loaders.Loader();
        loader.add(options.pixiSprites).add(options.displacementImage);
        
        
        // INITIALIZE PIXI
        this.initPixi = function() {
            // add canvas to HTML
            document.body.appendChild(renderer.view);
            
            // add child container to the main container
            stage.addChild(slidesContainer);
            
            // set ineractive
            stage.interactive = options.interactive;
            
            // set full screen
            if (options.fullScreen === true) {
                renderer.view.style.objectFit = 'cover';
                renderer.view.style.position = 'absolute';
                renderer.view.style.width = window.innerWidth + 'px';
                renderer.view.style.height = window.innerHeight + 'px';
                renderer.view.style.top = '50%';
                renderer.view.style.left = '50%';
                renderer.view.style.webkitTransform = 'translate( -50%, -50% ) scale(1.2)';
                renderer.view.style.transform = 'translate( -50%, -50% ) scale(1.2)';  
            } else {
                renderer.view.style.maxWidth = window.innerWidth + 'px';
                renderer.view.style.top = '50%';
                renderer.view.style.left = '50%';
                renderer.view.style.webkitTransform = 'translate( -50%, -50% )';
                renderer.view.style.transform = 'translate( -50%, -50% )';  
            }
            
            displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
            
            // set filter to the stage
            stage.filters = [displacementFilter];
            
            // set initilizing options for the filter
            if (options.autoPlay === false) {
                displacementFilter.scale.x = 0;
                displacementFilter.scale.y = 0;
            }
            
            if (options.wacky === true) {
                displacementSprite.anchor.set(0.5);
                displacementSprite.x = renderer.width / 2;
                displacementSprite.y = renderer.height / 2; 
            }
            
            displacementSprite.scale.x = 2;
            displacementSprite.scale.y = 2;
//            displacementSprite.scale.set(renderer.screen.height/displacementSprite.height);
            
            if (options.displacementCenter === true) {
                displacementSprite.anchor.set(0.5);
                displacementSprite.x = renderer.screen.width / 2;
                displacementSprite.y = renderer.screen.height / 2;        
            }
            
            // PIXI tries to fit the filter bounding box to the renderer so we optionally bypass
            displacementFilter.autoFit = options.displacementAutoFit;
            
            stage.addChild(displacementSprite);
        };
        
        
        // LOAD SLIDES TO CANVAS
        this.loadPixiSprites = function(sprites) {
            var spritesSrcs = sprites;
            var textSrcs = options.texts;
            
            for (let i = 0; i < spritesSrcs.length; i++) {
                let texture = new PIXI.Texture.fromImage(spritesSrcs[i]);
                var image = new PIXI.Sprite(texture);
                
                image.originWidth = image.width;
                image.originHeight = image.height;
                
                resizeImage(image);
                
                // display text
                if (textSrcs) {
                    var richText = new PIXI.Text(textSrcs[i], style);
                    image.addChild(richText);
                    
                    richText.scale.set(1/imgScale);
                    richText.anchor.set(0.5);
                    richText.x = 0;
                    richText.y = 0;
//                    richText.x = image.width / 2;
//                    richText.y = image.height / 2;
                    
                    
                }
                
                if (options.centerSprites === true) {
                    image.anchor.set(0.5);
                    image.x = renderer.screen.width / 2;
                    image.y = renderer.screen.height / 2;
                }
                
                
                // hide all the other pictures 
                if (i != 0) {
                    TweenMax.set(image, {alpha: 0});
                }
                
                slidesContainer.addChild(image);
            }
              
        };
        
        
        // RENDER / ANIMATION
        if (options.autoPlay === true) {
            var ticker = new PIXI.ticker.Ticker();

            ticker.autoStart = options.autoPlay;

            ticker.add(function(delta) {
                displacementSprite.x += options.autoPlaySpeed[0] * delta;
                displacementSprite.y += options.autoPlaySpeed[1];
                renderer.render(stage);
            });
        } else {
            var ticker = new PIXI.ticker.Ticker();

            ticker.autoStart = true;

            ticker.add(function(delta) {
                renderer.render(stage);
            });
        }
        

        // INTERACTION: CLICK 
        stage.pointerdown = function(e) {
            var mouseX = e.data.global.x;
            var mouseY = e.data.global.y;
            TweenMax.to(displacementFilter.scale, 1, {x: '+=' + Math.sin(mouseX)*1200 + '', y: '+=' + Math.cos(mouseY)*200 + ''});
        };
        
        stage.pointerup = function(e) {
            TweenMax.to(displacementFilter.scale, 1, {x: 0, y: 0, onComplete: function() {
                TweenMax.to(displacementFilter.scale, 1, {x: 20, y: 20});
            }});
        }
        
        
        // PAGE TRANSITION
        var isPlaying = false;
        var slideImages = slidesContainer.children;
        var slideBtns = options.slideBtnElement;
        this.moveSlider = function(newIndex) {
            isPlaying = true;
            slideBtns[that.currentIndex].classList.remove('active');
            slideBtns[newIndex].classList.add('active');
            
            var baseTimeline = new TimelineMax({
                onComplete: function() {
                    that.currentIndex = newIndex;
                    isPlaying = false;
                    if (options.wacky === true) {
                        displacementSprite.scale.set(1);
                    }
                },
                onUpdate: function() {
                    if (options.wacky === true) {
                        displacementSprite.rotation += baseTimeline.progress() * 0.02;
                        displacementSprite.scale.set(baseTimeline.progress() * 3);
                    }
                }
            });
            
            baseTimeline.clear();
            
            if(baseTimeline.isActive()) {
                return;
            }
            
//            baseTimeline
//                .to(displacementFilter.scale, 0.8, {x: options.displaceScale[0], y: options.displaceScale[1], ease: Power2.easeIn})
//                .to(slideImages[that.currentIndex], 0.5, {alpha: 0, ease: Power2.easeOut}, 0.4)
//                .to(slideImages[newIndex], 0.8, {alpha: 1, ease: Power2.easeOut}, 1)
//                .to(displacementFilter.scale, 0.7, {x: options.displaceScaleTo[0], y: options.displaceScaleTo[1], ease: Power1.easeOut}, 0.9);
            
            baseTimeline
                .to(displacementFilter.scale, 1, {x: options.displaceScale[0], y: options.displaceScale[1]})
                .to(slideImages[that.currentIndex], 0.5, {alpha: 0})
                .to(slideImages[newIndex], 0.5, {alpha: 1})
                .to(displacementFilter.scale, 1, {x: options.displaceScaleTo[0], y: options.displaceScaleTo[1]});
            
        }
        
        var navBtns = options.navElement;
        for (let i = 0; i < navBtns.length; i++) {
            var navItem = navBtns[i];
            navItem.addEventListener('click', function(e) {
                if (isPlaying) {
                    return false;
                }
                
                if (this.getAttribute('data-nav') === 'next') {
                    if (that.currentIndex >=0 && that.currentIndex < slideImages.length - 1) {
                        that.moveSlider(that.currentIndex + 1);
                    } else {
                        that.moveSlider(0);
                    }
                    
                } else {
                    if (that.currentIndex > 0 && that.currentIndex < slideImages.length) {
                        that.moveSlider(that.currentIndex - 1);
                    } else {
                        that.moveSlider(slideImages.length - 1);
                    }
                }
                                
                return false;
            });
        }
        
        for (let i = 0; i < slideBtns.length; i++) {
            var sbtn = slideBtns[i];
            sbtn.addEventListener('click', function(e) {
                if (isPlaying) {
                    return false;
                }
                
                that.moveSlider(i);
                return false;
            });
        }
        
        
        // LOADER
        let countNum = 0;
        var loaderId = window.setInterval(function() {
            if (countNum % 4 == 0) {
                options.loaderElement.innerHTML = "loading";
            } else {
                options.loaderElement.innerHTML += ".";
            }
            
            countNum++;
        }, 300);
        this.removeLoader = function(element) {
            element.classList.add('hide');
            window.clearInterval(loaderId);
            countNum = 0;
        }


        // INIT
        this.init = function() {
            that.initPixi();
            that.loadPixiSprites(options.pixiSprites);
            
            if ( options.fullScreen === true ) {
              window.addEventListener('resize', function( event ){ 
                scaleToWindow(renderer.view);
              });
            }
            
            that.removeLoader(options.loaderElement);
        };


        // START
//        this.init();
        loader.onComplete.add(this.init);
        loader.load();
        
    }
})();