function desktop(element) {
    element.style.visibility = "visible";

    const wallpaper = element.querySelector("#desktop > #wallpaper");

    wallpaper.style.backgroundImage = 'url("desktop/wallpaper.png")';
}