function delay(milis) {
    return new Promise(resolve => setTimeout(resolve, milis));
}

function urlExists(url) {
    var request;
    if (window.XMLHttpRequest) {
        request = new XMLHttpRequest();
    } else {
        request = new ActiveXObject("Microsoft.XMLHTTP");
    }
    request.open('GET', url, false);
    request.send();

    return request.status == 200;
}

function getChildByClass(child, className) {
    return Array.from(child.children).find(item => item.classList.contains(className));
}

function nextElement(array, element) {
    return array.indexOf(nextElementIndex(array, element));
}

function nextElementIndex(array, element) {
    const index = array.indexOf(element);
    try {
        return index + 1;
    } catch (error) {
        return index;
    }
}

function generateRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

function midScreenX() {
    return (Number(window.getComputedStyle(document.body).width) / 2)
}

function midScreenY() {
    return (Number(window.getComputedStyle(document.body).height) / 2)
}

function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
}

function changeStylesheetRule(stylesheet, selector, property, value) {
    // Make the strings lowercase
    selector = selector.toLowerCase();
    property = property.toLowerCase();
    value = value.toLowerCase();
    
    // Change it if it exists
    for(var i = 0; i < stylesheet.cssRules.length; i++) {
        var rule = stylesheet.cssRules[i];
        if(rule.selectorText === selector) {
            rule.style[property] = value;
            return;
        }
    }
  
    // Add it if it does not
    stylesheet.insertRule(selector + " { " + property + ": " + value + "; }", 0);
}