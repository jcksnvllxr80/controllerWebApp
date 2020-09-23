var granimInstance = new Granim({
    element: '#canvas-interactive',
    name: 'interactive-gradient',
    elToSetClassOn: '.canvas-interactive-wrapper',
    direction: 'diagonal',
    isPausedWhenNotInView: true,
    stateTransitionSpeed: 500,
    states : {
        "default-state": {
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
        "json-view-state": {
            gradients: [ ['#FF4E50', '#F9D423'] ],
            loop: false
        }
    }
});

// With jQuery
$('#control-state-cta').on('click', function(event) {
    event.preventDefault();
    granimInstance.changeState('default-state');
    setClass('#control-state-cta')
    activateControlState();
});

$('#configure-state-cta').on('click', function(event) {
    event.preventDefault();
    granimInstance.changeState('configure-state');
    setClass('#configure-state-cta')
    activateConfigureState();
});

$('#json-view-state-cta').on('click', function(event) {
    event.preventDefault();
    granimInstance.changeState('json-view-state');
    setClass('#json-view-state-cta')
    activateJsonViewState();
});

function activateControlState() {
    document.getElementById('controller').hidden = false;
    document.getElementById('configure').hidden = true;
    document.getElementById('viewer').hidden = true;
}

function activateConfigureState() {
    document.getElementById('controller').hidden = true;
    document.getElementById('configure').hidden = false;
    document.getElementById('viewer').hidden = true;
}

function activateJsonViewState() {
    document.getElementById('controller').hidden = true;
    document.getElementById('configure').hidden = true;
    document.getElementById('viewer').hidden = false;
}

function setClass(element) {
    $('.canvas-interactive-wrapper a').removeClass('active');
    $(element).addClass('active');
};

$(function(){
    resizeCanvas();
});

$(document).on('resize', function(){
    resizeCanvas();
});

function resizeCanvas()
{
    var canvas = $('#canvas-interactive');
    canvas.css("width", $(document).width());
    canvas.css("height", $(document).height());
}
