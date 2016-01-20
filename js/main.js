$(document).ready(function(){
    $.protip();
});



var el = $('.my-el');

// Shows tooltip with title: "My element"
el.protipShow();

// Shows tooltip with title: "My new title"
el.protipShow({
    title: 'My new title'
});

// Changed trigger from hover to click
el.protipSet({
    trigger: 'click'
});

// Changed trigger from hover to click and also show it
el.protipShow({
    trigger: 'click'
});