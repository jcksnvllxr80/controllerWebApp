var granimInstance = new Granim({
    element: '#canvas-interactive',
    name: 'interactive-gradient',
    elToSetClassOn: '.canvas-interactive-wrapper',
    direction: 'diagonal',
    isPausedWhenNotInView: true,
    stateTransitionSpeed: 500,
    states : {
        "control-state": {
            gradients: [
                ['#B3FFAB', '#12FFF7'],
                ['#ADD100', '#7B920A'],
                ['#1A2980', '#26D0CE']
            ],
            transitionSpeed: 10000
        },
        "configure-state": {
            gradients: [
                ['#9D50BB', '#6E48AA'],
                ['#4776E6', '#8E54E9']
            ],
            transitionSpeed: 2000
        },
        "orange-state": {
            gradients: [ ['#FF4E50', '#F9D423'] ],
            loop: false
        }
    }
});

// With jQuery
$('#control-state-cta').on('click', function(event) {
    event.preventDefault();
    granimInstance.changeState('control-state');
    setClass('#control-state-cta')
    document.getElementById('configure').hidden = true;
});

$('#configure-state-cta').on('click', function(event) {
    event.preventDefault();
    granimInstance.changeState('configure-state');
    setClass('#configure-state-cta')
    document.getElementById('configure').hidden = false;
});

$('#orange-state-cta').on('click', function(event) {
    event.preventDefault();
    granimInstance.changeState('orange-state');
    setClass('#orange-state-cta')
    document.getElementById('configure').hidden = true;
});

function setClass(element) {
    $('.canvas-interactive-wrapper a').removeClass('active');
    $(element).addClass('active');
};

$(function(){
    resizeCanvas();
});

$(window).on('resize', function(){
    resizeCanvas();
});

function resizeCanvas()
{
    var canvas = $('#canvas-interactive');
    canvas.css("width", $(window).width());
    canvas.css("height", $(window).height());
}









