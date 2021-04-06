define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RTView = void 0;
    class RTView {
        constructor() {
            this.canvas = document.querySelector("#raytraceCanvas");
            if (!this.canvas) {
                console.log("Failed to retrieve the <canvas> element");
                return;
            }
            //button clicks
            let button = document.querySelector("#savebutton");
            button.addEventListener("click", ev => this.saveCanvas());
        }
        saveCanvas() {
            let link = document.createElement('a');
            link.href = this.canvas.toDataURL('image/png');
            link.download = "result.png";
            link.click();
        }
        fillCanvas() {
            let width = Number(this.canvas.getAttribute("width"));
            let height = Number(this.canvas.getAttribute("height"));
            let imageData = this.canvas.getContext('2d').createImageData(width, height);
            for (let i = 0; i < height; i++) {
                for (let j = 0; j < width; j++) {
                    imageData.data[4 * (i * width + j)] = Math.random() * 255;
                    imageData.data[4 * (i * width + j) + 1] = Math.random() * 255;
                    imageData.data[4 * (i * width + j) + 2] = Math.random() * 255;
                    imageData.data[4 * (i * width + j) + 3] = 255;
                }
            }
            this.canvas.getContext('2d').putImageData(imageData, 0, 0);
            let context = this.canvas.getContext('2d');
            context.fillStyle = 'red';
            context.fillRect(100, 100, 200, 100);
        }
    }
    exports.RTView = RTView;
});
//# sourceMappingURL=RTView.js.map