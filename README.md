ImageGallery
============

Sencha Touch 2 gallery plugin

Minimum Sencha touch version: 2.1

It can be added to any panel or container like in the example below


<pre><code>
{
    xtype: 'panel',
    name: 'gallerypanel',
    plugins: {
        xclass: 'Ext.plugin.ImageGallery',
        galleryType: 'listcarousel',//carousel or listcarousel. defaults to carousel
        autoInitialize: false,// defaults to true. make it false if you want to initialize it later
        pinchZoom: true,//defaults to true
        listFullWidth: true,//defaults to false
        listBorder: '4px solid #fff',//border around the thumb when galleryType is listcarousel
        defaultClose: false,// defaults to true. if you want to use different button, set false
        closeButtonId: 'galleryoverlayclose' //ID of the buttion which you want to use to close the modal carousel when defaultClose is false
    },
    data: [
        'files/slideshow/style1.jpg',
        'files/slideshow/style2.jpg',
        'files/slideshow/style3.jpg',
        'files/slideshow/style4.jpg',
        'files/slideshow/style5.jpg',
        'files/slideshow/style6.jpg',
        'files/slideshow/style7.jpg',
        'files/slideshow/style8.jpg',
        'files/slideshow/style9.jpg',
        'files/slideshow/style10.jpg',
        'files/slideshow/style11.jpg',
        'files/slideshow/style12.jpg'
    ]// images path
}

</code></pre>

Existing apps that uses this gallery plugin
https://itunes.apple.com/au/app/waxed/id702899178?mt=8 (ST 2.1)
https://itunes.apple.com/au/app/simply-elegant-beauty-salon/id689962180?mt=8 (ST 2.1)
https://itunes.apple.com/au/app/the-cutting-edge-hair-studio/id616576284?mt=8 (ST 2.0)
