javascript:(function(){
    try {
        window.athlytixAddData()
    } catch (e) {
        var s = document.createElement('script'),
            t = window.location.match(/https/) ? 'https' : 'http';
        s.type = 'text/javascript';
        s.src = t + '://www.athlytix.org/static/js/bookmarklet.js';
        document.body.appendChild(s);
    }
})();