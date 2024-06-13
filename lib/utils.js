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