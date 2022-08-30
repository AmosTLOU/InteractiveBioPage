var isMobile;
var game;

// window with and window height
var ww = window.innerWidth;
var wh = window.innerHeight;

window.onload = function() 
{
    isMobile = navigator.userAgent.indexOf("Mobile");
    if (isMobile == -1) 
    {
        isMobile = navigator.userAgent.indexOf("Tablet");
    }
    // non-mobile
    if (isMobile == -1) 
    {
        var config = 
        {
            type: Phaser.AUTO,
            // width: 480,
            // height: 640,
            width: ww,
            height: wh,
            parent: 'phaser-game',
            scene: [SceneMain]
        };
    } 
    // mobile
    else 
    {
        var config = 
        {
            type: Phaser.AUTO,
            // width: window.innerWidth,
            // height: window.innerHeight,
            width: ww,
            height: wh,
            parent: 'phaser-game',
            scene: [SceneMain]
        };
    }
    game = new Phaser.Game(config);
}
