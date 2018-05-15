// import the fs package to browse the filesystem
const fs = require('fs');
const system = require('system');

const args = system.args;
const page = new WebPage();



function getLinks() {

    return page.evaluate(function () {
        return Array.prototype.map.call(document.querySelectorAll('a'), function (link) {
            return link.getAttribute('href');
        });
    });
}

function iterate() {

    var time = 1000;

    while (index < targetLinks.length)
    {

        if (targetLinks[index] !== "#")
        {
            window.setTimeout(function (i) {

                var link = targetLinks[i];

                if (link[0] === '/')
                {
                    link = args[1] + link;
                }
                if (~link.indexOf(args[1] + args[2]))
                {
                    console.log("Scraping link " + i + ": " + link);
                    page.open(link);
                }

            }, time, index);

            time += 1500;
        }
        index += 1;
    }

    window.setTimeout(function () {
        if (index < targetLinks.length)
        {
            iterate();
        }
        else {
            phantomjs.exit();
        }
    }, time + 1500);

}


var targetLinks = [];
var index = 0;

page.open(args[1] + args[2], function () {

    targetLinks = getLinks();
    iterate();
});



page.onLoadFinished = function()
{
    targetLinks = targetLinks.concat(getLinks()).unique();

    var url = page.url;

    if (url[url.length - 1] === '/')
    {
        url = url.substring(0, url.length - 1);
    }
    if (url === args[1])
    {
        url += '/index'
    }

    fs.write(url.substring(8) + '.txt', page.plainText, 'w');

};

Array.prototype.unique = function() {
    var a = this.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
};

page.onError = function(msg, trace) {};