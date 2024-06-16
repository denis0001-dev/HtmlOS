const stylesheet = document.head.querySelector("style#animation_cache");

function addRule(rule) {
    stylesheet.append(rule);
}

function removeRule(rule) {
    stylesheet.remove(rule);
}

function getRule(rule) {
    return stylesheet;
}