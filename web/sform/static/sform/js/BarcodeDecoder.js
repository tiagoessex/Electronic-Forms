
import { Translator } from '/static/js/Translator.js';


/**
 * 
 * @param {function} onDetect On detect, call function and pass the code and the barcode image.
 * @param {function} onError On error, call function and pass error message.
 */
export function BarcodeDecoder(onDetect = null, onError = null) {

    this.last_code = null;
    this.onError = onError;
    this.onDetect = onDetect;
    const ref = this;
    
    /**
     * On livestream sucesseful detection, get a snapshoot and pass it along with the code.
     */
    Quagga.onDetected(function(result) {
        const code = result.codeResult.code;
        if(code != null && code != ref.last_code) {
            ref.last_code = code;       
            const video = document.getElementById("interactive").getElementsByTagName('video')[0];
            if (video) {
                const image = ref.draw(video);
                if (onDetect) onDetect(code, image);
            }
        }
    });

};

BarcodeDecoder.prototype = {

    /**
     * Read the barcode of single static image, if sucesseful, pass the image and the code.
     * @param {uri} file File to analyze.
     */
    decodeImage(file) {
        const self = this;
        self.reset();
        Quagga.decodeSingle({
            locator: {
                patchSize: "medium",
                halfSample: true
            },	
            frequency: 20,
            decoder: {
                readers : [{
                    format: "code_128_reader",
                    config: {}
                }, {
                    format: "ean_reader",
                    config: {}
                }, {
                    format: "code_39_reader",
                    config: {}
                }, {
                    format: "upc_reader",
                    config: {}
                }, {
                    format: "codabar_reader",
                    config: {}
                }, {
                    format: "i2of5_reader",
                    config: {}
                }, {
                    format: "2of5_reader",
                    config: {}
                }, {
                    format: "code_93_reader",
                    config: {}
                }]
            },
            numOfWorkers: (navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 4),
            locate: true, // try to locate the barcode in the image
            src: file, // or 'data:image/jpg;base64,' + data
        }, function(result){
            if(result && result.codeResult) {
                const canvas = document.getElementById("interactive").getElementsByTagName('canvas')[0];
                if (canvas) {
                    const image = canvas.toDataURL();
                    if (self.onDetect) self.onDetect(result.codeResult.code, image);
                }
            } else {
                if (self.onError) self.onError(Translator.translate("Unable to process the barcode!"));
            }            
        });
    },
    
    /**
     * 
     * @returns Returns a snapshoot image.
     */
    draw: function(video) {
        var canvas = document.createElement('canvas');
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        var img = new Image();
        img.src = canvas.toDataURL();
        return img.src;
    },

    /**
     * Init Quagga, in livestream mode.
     * Also, use visual aid during analysis.
     */
    init: function() {
        const self = this;
        self.reset();
        Quagga.init(this.state, function(err) {            
            if (err) {
                return self.handleError(err);
            }
            //Quagga.registerResultCollector(resultCollector);
            Quagga.start();
 
            Quagga.onProcessed(function(result) {
                var drawingCtx = Quagga.canvas.ctx.overlay,
                    drawingCanvas = Quagga.canvas.dom.overlay;                
 
                if (result) {
                    if (result.boxes) {
                        drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
                        result.boxes.filter(function (box) {
                            return box !== result.box;
                        }).forEach(function (box) {
                            Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: "green", lineWidth: 2});
                        });
                    }
 
                    if (result.box) {
                        Quagga.ImageDebug.drawPath(result.box, {x: 0, y: 1}, drawingCtx, {color: "#00F", lineWidth: 2});
                    }
 
                    if (result.codeResult && result.codeResult.code) {
                        Quagga.ImageDebug.drawPath(result.line, {x: 'x', y: 'y'}, drawingCtx, {color: 'red', lineWidth: 3});
                    }
                }
            });
            // just to make sure camera is on, before setting it.
            setTimeout(function() {
              var track = Quagga.CameraAccess.getActiveTrack();
              var capabilities = {};
              if (typeof track.getCapabilities === 'function') {
                try
                  {
                 capabilities = track.getCapabilities();
                 track.applyConstraints({advanced: [{zoom: 2.5}]});
                  } catch(e) {}
              }
            }, 500);
        });
    },

    /**
     * Reset the visualization area.
     * @param {boolean} clear If true, then clear all elements inside the area, including the visual aid.
     * @returns True if all clear => it was in livestream mode, else False => static image mode.
     */
    reset: function(clear = true) {
        if (clear) $('#interactive').empty();
        var drawingCtx = Quagga.canvas.ctx.overlay,
        drawingCanvas = Quagga.canvas.dom.overlay;
        if (drawingCtx && drawingCanvas) {
            drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));        
            return true;
        }
        return false;
    },

    /**
     * Stop the Quagga.
     */
    stop: function() {
        if (this.reset())
            Quagga.stop();
    },

    /**
     * On error.
     * @param {string} err Error message.
     */
    handleError: function(err) {
        console.error(err);
        if (this.onError) this.onError(err);
    },

    /**
     * Livestream state.
     */
    state: {
        inputStream: {
            type : "LiveStream",
            constraints: {
                facingMode: "environment"
            }
        },
        locator: {
            patchSize: "medium",
            halfSample: true
        },
        numOfWorkers: (navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 4),
        frequency: 20,
        decoder: {
            readers : [{
                format: "code_128_reader",
                config: {}
            }, {
                format: "ean_reader",
                config: {}
            }, {
                format: "code_39_reader",
                config: {}
            }, {
                format: "upc_reader",
                config: {}
            }, {
                format: "codabar_reader",
                config: {}
            }, {
                format: "i2of5_reader",
                config: {}
            }, {
                format: "2of5_reader",
                config: {}
            }, {
                format: "code_93_reader",
                config: {}
            }]
        },
        locate: true
    },
}
     