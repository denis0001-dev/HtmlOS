async function boot() {
    const loading_screen = new LoadingScreen(document.getElementById("loading_screen"));
    loading_screen.start();
    await delay(5000);

    loading_screen.spinner.stop();

    await delay(1000);

    loading_screen.stop();

    desktop(document.getElementById("main"));
}