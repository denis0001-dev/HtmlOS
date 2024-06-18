var stylesheet = document.head.querySelector("style#animation_cache");

function init_cache() {
    stylesheet = document.head.querySelector("style#animation_cache");
}

function addRule(rule) {
    stylesheet.append(rule);
}

function removeRule(rule) {
    stylesheet.remove(rule);
}