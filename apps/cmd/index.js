document.addEventListener("DOMContentLoaded", main);

function main() {
    const cl = document.getElementById("console");
    const caret = document.getElementById("caret");

    let caret_line = 0;
    let caret_col = 0;

    for (let line = 0; line < cl.children.length; line++) {
       const item = cl.children[line];
       caret_line++;

       let br = false;

       for (let col = 0; col < item.children.length; col++) {
           const str = item.children[col];
           const text = str.textContent;

           if (str === caret) {
               br = true;
               break;
           }

           for (let i = 0; i < text.length; i++) {
               caret_col++;
           }
       }

       if (br) break;
    }
    console.log(caret_line, caret_col);


    addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") {
            if (Number(caret.style.left.replace("px", "")) <= 0) return;
            const pos = caret.getBoundingClientRect();

            const left = pos.left - pos.width;

            caret.style.position = "absolute";
            caret.style.left = `${left}px`
        }
    });
}