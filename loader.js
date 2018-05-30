const fs = require('fs');
const system = require('system');

// retrieves the user-entered arguments
const args = system.args;

// initializes necessary
var host = "";
var url = "";
var targetLinks = [];
var index = 0;

// if the user does not pass any arguments
if (args.length === 1)
{
    // alert the user that no arguments have been given
    console.log("Please enter the website that you would like to scrape as an argument.");

    // stop phantom execution
    phantom.exit();
}

// if the user passes exactly one argument
else if (args.length === 2)
{
    // set both the host and the url to that argument
    host = args[1];
    url = args[1];
}
// if the user passes in two or more arguments
else
{
    // set the host to the first argument
    host = args[1];

    // set the url to the first argument + the second argument
    url = args[1] + args[2];
}

// open a new headless web page
const page = new WebPage();

// navigate to the url that the user passed as an argument
page.open(url, function () {

    // retrieve the links from this url
    targetLinks = getLinks();

    // begin the iterative process of finding and saving all web content
    iterate();
});

// when a web page is finished loading, run the following code
page.onLoadFinished = function()
{
    // retrieve all the links on this web page and add them to the target links
    targetLinks = targetLinks.concat(getLinks()).unique();

    // get the current url
    var url = page.url;

    // if the url has a back slash at the end of it
    if (url[url.length - 1] === '/')
    {
        // remove the back slash
        url = url.substring(0, url.length - 1);
    }

    // if the url is the same as the host
    if (url === host)
    {
        // add index to the end of the url
        url += '/index'
    }

    // save the page's plain text at the url path to the computer
    fs.write('results/' + url.substring(8) + '.txt', page.plainText, 'w');

};

// get the links from the current page
function getLinks() {

    // return an evaluation of the web page
    return page.evaluate(function () {

        // iterate over all of the web elements of type a
        return Array.prototype.map.call(document.querySelectorAll('a'), function (link) {

            // get the links from the web elements
            return link.getAttribute('href');
        });
    });
}


function iterate() {

    // initialize the wait time to one second
    var waitTime = 1000;

    // while there are more items to be searched
    while (index < targetLinks.length)
    {
        // if the current link is a valid url
        if (targetLinks[index] !== "#")
        {
            // queue a search for the url for a later time
            window.setTimeout(function (i) {

                // create a link variable to be searched
                var link = targetLinks[i];

                // if the link is shortened
                if (link[0] === '/')
                {
                    // add the host to the beginning of the link
                    link = host + link;
                }

                // if the link is in the same directory as the url
                if (~link.indexOf(url))
                {
                    // print out the link that is currently being scraped
                    console.log("Scraping link " + i + ": " + link);

                    // open the link
                    page.open(link);
                }

            }, waitTime, index);

            // increase the wait time by a second and a half
            waitTime += 1500;
        }

        // increase the index pointing to the urls by one
        index += 1;
    }

    // schedule the next iteration in the amount of time it will take to complete the previous one
    window.setTimeout(function ()
    {
        // if there are more links to scrape
        if (index < targetLinks.length)
        {
            // scrape the links
            iterate();
        }

        // if there are no more links to scrape
        else {
            // quite execution
            phantom.exit();
        }
    }, waitTime + 1500);

}

// stop the page from printing errors to the console
page.onError = function(msg, trace) {};

// removes duplicates from array
Array.prototype.unique = function()
{
    var a = this.concat();

    for(var i=0; i < a.length; i++)
    {
        for(var j = i + 1; j<a.length; j++)
        {
            if(a[i] === a[j])
            {
                a.splice(j--, 1);
            }
        }
    }

    return a;
};

