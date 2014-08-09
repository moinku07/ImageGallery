Ext.define('Ext.plugin.ImageGallery', {
    extend: 'Ext.util.Observable',
    alias: 'plugin.imagegallery',
    config: {
        galleryType: 'carousel',
        autoInitialize: true,
		pinchZoom:true,
        galleryData: null,
        galleryStore: null,
        imageField: null,
		listFullWidth: false,
		listBorder: false,
		defaultClose: true,
		closeButtonId: null
    },
    init: function(cmp) {
        this.gallery = cmp;
        if (this.config.autoInitialize) this.hasData();
    },
    hasData: function() {
        var that = this;
        if (this.config.galleryData != null) {
            this.construct();
        } else if (this.config.galleryData == null && !this.config.galleryStore && this.gallery.getData()) {
            if (that.config.galleryType == 'listcarousel') {
				that.modalOverlayInitialised = false;
                that.config.galleryData = [];
                this.gallery.getData().forEach(function(record) {
                    that.config.galleryData.push({
                        'src': typeof(ROOT) != 'undefined' ? ROOT + record : record
                    });
                });
            } else {
                this.config.galleryData = [];
				this.gallery.getData().forEach(function(r,i){
					that.config.galleryData.push(typeof(ROOT) != 'undefined' ? ROOT + r : r);
				});
            }
            that.construct();
        } else if (this.config.galleryStore && this.config.imageField) {
            this.intervalId = setInterval(function() {
                if (Ext.getStore(that.config.galleryStore) && Ext.getStore(that.config.galleryStore).getData().length > 0) {
                    clearInterval(that.intervalId);
                    that.config.galleryData = [];
                    Ext.getStore(that.config.galleryStore).getData().items.forEach(function(record) {
                        if (that.config.galleryType == 'carousel') that.config.galleryData.push(typeof(ROOT) != 'undefined' ? ROOT + record.data[that.config.imageField] : record.data[that.config.imageField]);
                        if (that.config.galleryType == 'listcarousel') {
                            that.config.galleryData.push({
                                'src': typeof(ROOT) != 'undefined' ? ROOT + record.data[that.config.imageField] : record.data[that.config.imageField]
                            });
                        }
                    });
                    that.construct();
                } else if (!Ext.getStore(that.config.galleryStore)) {
                    clearInterval(that.intervalId);
                    Ext.Msg.alert('Error', 'The galleryStore id "' + that.config.galleryStore + '" is not correct.');
                }
            },
            1);
        } else {
            Ext.Msg.alert('Error', 'You need to set data or either galleryData or galleryStore and imageField for image gallery');
        }
    },
    construct: function() {
        if (this.config.galleryType == 'carousel') this.initializeCarousel();
        else if (this.config.galleryType == 'listcarousel') this.initializeListCarousel();
        else Ext.Msg.alert('Error', this.config.galleryType + 'is unsupported galleryType. Supported galleryType are carousel and listcarousel');
    },
    initialize: function() {
        this.hasData();
    },
    initializeCarousel: function() {
        var that = this;
        this.gallery.setLayout({
            animation: 'slide',
            type: 'card'
        });
        this.gallery.setScrollable(false);
        this.setCarouselImages(this.gallery);
    },
    setCarouselImages: function(galleryPanel) {
        var that = this;
        function galleryNext() {
            var totalItems = galleryPanel.getItems().length - 1,
            currentItem = galleryPanel.getItems().indexOf(galleryPanel.getActiveItem());
            if (currentItem < totalItems) {
                galleryPanel.getLayout().setAnimation({
                    type: 'slide',
                    direction: 'left'
                });
                galleryPanel.setActiveItem(currentItem + 1);
            }
            setTimeout(function() {
                that.swipeFired = false;
                that.dragFired = false;
            },
            500);
        }
        function galleryPrevous() {
            var totalItems = galleryPanel.getItems().length - 1,
            currentItem = galleryPanel.getItems().indexOf(galleryPanel.getActiveItem());
            if (currentItem > 0) {
                galleryPanel.getLayout().setAnimation({
                    type: 'slide',
                    direction: 'right'
                });
                galleryPanel.setActiveItem(currentItem - 1);
            }
        }
        if (this.config.galleryData.length > 0) {
            this.galleryItems = [];
			var scrollable = {
									direction: 'both',
									indicators: false,
									directionLock: true
								};
            this.config.galleryData.forEach(function(record, index) {
				that.galleryItems.push({
                    xtype: 'panel',
                    style: 'background:#000',
                    layout: {
                        pack: 'center',
                        type: 'vbox'
                    },
                    scrollable: that.config.pinchZoom ? scrollable : null,
                    items: [{
                        xtype: 'image',
                        name: 'carouselimage',
                        flex: 1,
                        style: 'background-size:100% auto; background-position:center center',
                        src: that.config.galleryType == 'carousel' ? record: record.src,
                        listeners: {
                            load: function(img, e, options) {
                                var allowedEvents = ['pinch', 'tap'],
								currentScale = null,
                                originalWidth = null,
                                originalHeight = null,
                                orgPreScale, nextScale, width,height;
                                width = (window.innerWidth > 0) ? window.innerWidth: screen.width;
								height = (window.innerHeight > 0) ? window.innerHeight: screen.height;
                                var bgImg = new Image();
                                bgImg.src = img.getSrc();
                                originalWidth = bgImg.width;
                                originalHeight = bgImg.height; //originalWidth = 640;
                                //originalHeight = 960;
                                currentScale = width / originalWidth;
                                nextScale = currentScale; //img.setHeight(originalHeight * nextScale);
                                //img.setWidth(originalWidth * nextScale);
                                if (!originalWidth && !originalHeight) return false;
                                this.getEventDispatcher().addListener('element', '#' + img.getId(), '*',
                                function(e, target, opts, events) {
									if( !! events && allowedEvents.indexOf(events.info.eventName) == -1)
										return false;
                                    /*if ( !! events && events.info.eventName == 'swipe' && !that.dragFired && that.isDragend) {
                                        if (nextScale == currentScale) {
                                            if (e.direction == 'left') {
												that.swipeFired = true;
												galleryNext();
                                            } else if (e.direction == 'right') {
                                                galleryPrevous();
                                            }
                                        }
                                        return false;
                                    }*/
									if ( !! events && events.info.eventName == 'tap') {
                                        if (nextScale < 1.4) {
											if(!that.config.pinchZoom){
												img.getParent().setScrollable(scrollable);
											}
											nextScale = 1.4;
                                            Ext.get(target).setHeight(originalHeight * nextScale);
                                            Ext.get(target).setWidth(originalWidth * nextScale);
                                        } else if (nextScale == 1.4) {
											if(!that.config.pinchZoom){
												img.getParent().setScrollable(null);
											}
											nextScale = currentScale;
                                            Ext.get(target).setHeight(null);
                                            Ext.get(target).setWidth(null);
                                        }
                                    }
                                    if ( !! events && events.info.eventName == 'pinchstart') {
                                        orgPreScale = e.scale;
                                    }
                                    if (that.config.pinchZoom && !! events && events.info.eventName == 'pinch') {
										if (e.scale - orgPreScale > 0) {
                                            nextScale += 0.03;
                                        } else {
                                            nextScale -= 0.03;
                                        }
                                        orgPreScale = e.scale;
                                        nextScale = Ext.Number.constrain(nextScale, currentScale, 1.4);
                                        if (nextScale > currentScale) {
											Ext.get(target).setHeight(originalHeight * nextScale);
                                            Ext.get(target).setWidth(originalWidth * nextScale);
                                        } else if (nextScale == currentScale) {
                                            Ext.get(target).setHeight(null);
                                            Ext.get(target).setWidth(null);
                                        }
                                    }
									if (nextScale == currentScale) {
                                        that.disableDragNext = false;
                                    } else if (nextScale > currentScale) {
                                        that.disableDragNext = true;
                                    }
                                },
                                this);
                            }
                        }
                    }],
                    listeners: {
                        initialize: function(component) {
                            component.element.on({
                                dragstart: function() {
                                    that.isDragend = true;
                                },
                                drag: function(drag) {
                                    if (!that.disableDragNext && that.isDragend && !that.swipeFired) {
                                        if (drag.deltaX < -80) {
                                            that.dragFired = true;
                                            that.isDragend = false;
                                            galleryNext();
                                        } else if (drag.deltaX > 80) {
                                            that.dragFired = true;
                                            that.isDragend = false;
                                            galleryPrevous();
                                        }
                                    }
                                },
                                dragend: function() {
                                    that.isDragend = true;
                                }
                            });
                        }
                    }
                });
            });
            if (this.config.galleryType == 'listcarousel' && this.config.defaultClose) {
                this.galleryItems.push({
                    xtype: 'button',
                    cls: ['image-gallery-modal-button'],
                    right: 0,
                    top: 0,
                    height: 30,
                    width: 30,
                    ui: 'plain',
                    handler: function(button) {
						if(that.modalOverlayInitialised)
							Ext.Viewport.setActiveItem(that.gallery.getParent());
                        that.modalOverlay.hide();
                    }
                });
            }
            galleryPanel.setItems(this.galleryItems);
        }
    },
    initializeListCarousel: function() {
        var that = this;
        //this.applyCSS();
        this.gallery.setLayout({
            //align: 'center',
            type: 'fit'
        });
        this.gallery.setScrollable(false);
		var modalOverlay = {
            xtype: 'panel',
            baseCls: 'gallerymodal',
            height: '100%',
            hidden: true,
            hideAnimation: 'fadeOut',
            showAnimation: 'fadeIn',
            style: 'background:#000',
            width: '100%',
            layout: {
                animation: 'slide',
                type: 'card'
            },
            modal: true,
            scrollable: false,
            listeners: {
                initialize: function(component) {
                    that.modalOverlay = component;
                    that.setCarouselImages(component);
                }
            }
        };
		if(this.config.closeButtonId){
			this.modalOverlay = this.gallery.getParent().add(modalOverlay);
		}else{
			if(Ext.Viewport.getLayout().isCard)
				that.modalOverlayInitialised = false;
			else
				this.modalOverlay = Ext.Viewport.add(modalOverlay);
		}
        this.gallery.setItems([{
            xtype: 'dataview',
            cls: ['image-gallery-list'],
            width: '96%',
			inline:true,
            layout: {
                //align: 'start',
                type: 'fit'
            },
            flex: 1,
            scrollable: {
                direction: 'vertical',
                indicators: false
            },
            data: that.config.galleryData,
            itemTpl: ['<div class="gallerylist-image"><img src="{src}" /></div>'],
            listeners: {
                itemtap: function(dataview, index, target, record, e, options) {
					if(Ext.Viewport.getLayout().isCard && !that.modalOverlayInitialised && !that.config.closeButtonId){
						that.modalOverlay = Ext.Viewport.add(modalOverlay);
						that.modalOverlayInitialised = true;
					}
                    that.modalOverlay.getLayout().setAnimation({
						type:'slide',
                        duration: 0
                    });
                    that.modalOverlay.setActiveItem(index);
					that.modalOverlay.getLayout().setAnimation({
						type:'slide',
                        duration: 250
                    });
					that.modalOverlay.show();
					if(that.config.closeButtonId){
						Ext.getCmp(that.config.closeButtonId).show();
					}
                }
            }
        }]);
		if(this.config.closeButtonId){
			Ext.getCmp(this.config.closeButtonId).on('tap',function(button){
				button.hide();
				that.modalOverlay.hide();
			});
		}
		this.applyCSS();
    },
    applyCSS: function() {
        if (!this.applyCss) {
			try{
				var width = (window.innerWidth > 0) ? window.innerWidth: screen.width;
				width = parseInt(width * parseInt(this.gallery.query('dataview')[0].getWidth())/100);
			}catch(e){}
			var style = document.createElement('style');
            style.type = 'text/css';
			if(width && width > 0){
				var imgWidth = parseInt((width - 36)/3);
				style.innerHTML += '.image-gallery-list .x-dataview-item{width: '+imgWidth+'px;height: '+imgWidth+'px;/*float: left;*/margin: 6px;} ';
			}else{
				style.innerHTML += '.image-gallery-list .x-dataview-item{width: 90px;height: 90px;float: left;margin: 6px;} ';
			}
            style.innerHTML += '.image-gallery-list .gallerylist-image img{max-width: 100%;max-height: 100%;display:block} ' + ".x-button.image-gallery-modal-button{background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6Q0Q2RTVFODUyQkU4MTFFMjg2MDhGRTgyRjQyNDlBMDMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6Q0Q2RTVFODYyQkU4MTFFMjg2MDhGRTgyRjQyNDlBMDMiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpDRDZFNUU4MzJCRTgxMUUyODYwOEZFODJGNDI0OUEwMyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpDRDZFNUU4NDJCRTgxMUUyODYwOEZFODJGNDI0OUEwMyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PhGlvxYAABlFSURBVHjavFsJcBzV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') no-repeat center center !important;background-size:100% 100% !important}" + '@media only screen and (min-width : 481px) and (max-width : 2048px){.image-gallery-list .x-dataview-item{width: 200px;height: 200px;}}';
			if(this.config.listFullWidth){
				style.innerHTML += '.image-gallery-list .gallerylist-image img{margin: 0 auto;height: 100%;width: 100%;}';
			}
			if(this.config.listBorder){
				style.innerHTML += '.image-gallery-list .x-dataview-item{border:' + this.config.listBorder + '}';
			}
            document.getElementsByTagName('head')[0].appendChild(style);
            this.applyCss = true;
        }
    }
});