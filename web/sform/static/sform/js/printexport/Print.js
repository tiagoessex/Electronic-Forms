import { delay } from '/static/js/jstime.js'


// styles required to apply for the print
const STYLES = `
    <link rel="stylesheet" type="text/css" href="/static/plugins/sheets/sheets-of-paper-a4.css">
    <link rel="stylesheet" type="text/css" href="/static/sform/css/elements.css">
`;
// time to wait for the styles to be applied to the printing page
const PRINTER_DELTA_TIME = 500; // ms


const { PDFDocument, PageSizes } = PDFLib

/**
 * Print.
 * @param {jQuery object} nodeParent parent of all the elements to be printed.
 */
export function Print(nodeParent) {
    const contents = nodeParent.html();
    
    // if the form is already in a iframe, then it came from PrintExportForm
    // so no need to an iframe inside an iframe.
    if (nodeParent.is('iframe')) {
        this.printing_frame = nodeParent;
        this.printing_frame.empty();
    } else {
        this.printing_frame = $('<iframe />');
    }

    this.printing_frame[0].name = "printing_frame";
    this.printing_frame.css({ "position": "absolute", "top": "-1000000px"});
    $("body").append(this.printing_frame);
    this.a = this.printing_frame[0].contentWindow ? this.printing_frame[0].contentWindow : this.printing_frame[0].contentDocument.document ? this.printing_frame[0].contentDocument.document : this.printing_frame[0].contentDocument;
    this.a.document.open();

    this.a.document.write('<html>');
    this.a.document.write('<head>');
    
    this.a.document.write(STYLES)
    this.a.document.write('</head>');
    this.a.document.write('<body >');
    this.a.document.write(contents);
    //console.log(contents)
    this.a.document.write('</body></html>');
    this.a.document.close(); 
}

Print.prototype = {
    /**
     * Required to make sure the styles are set.
     * @returns HTMLDocument
     */
    async init() {
        await delay(PRINTER_DELTA_TIME);
        return this.a.document;
    },

    /**
     * Export to PDF.
     * @param {string} filename Output PDF file.
     */
    async pdf(filename = 'form.pdf') {
        await printPDF(this.a.document, filename);
    },

    /**
     * 
     * @returns Returns an array: [base64 string representing a PDF, total number of pages]
     */
    async base64PDF() {
        return await printBase64PDF(this.a.document);
    },
    

    /**
     * Print the form.
     */
    print() {
        window.frames["printing_frame"].focus();
        window.frames["printing_frame"].print();
    },

    /**
     * End the service.
     */
    end() {
        this.printing_frame.remove();
    },
}



/**
 * Print the contents to a PDF file.
 * For simplicity, for each page, it creates a canvas image and adds it to a pdf document.
 * @param {node} dom HTML document to print.
 * @param {string} filename Output file.
 */
async function printPDF(dom, filename) {
    // browser zoom percentage level on non-retina displays
    // without this value, html2canvas resolution will be the same as
    // one views the form in the browser => can be either blury or pristine.
    const browserZoomLevel = Math.round(window.devicePixelRatio * 100);
    const zoom = 100 / browserZoomLevel + 0.5;    

    const pdfDoc = await PDFDocument.create();
    
    const pages = dom.getElementsByClassName('page');    

    for (let i=0; i<pages.length; i++) {
        const page = pdfDoc.addPage(PageSizes.A4);
        const canvas = await html2canvas(dom.querySelector('#' + pages[i].id), {
            scale: zoom,
            logging: false,/*
            onclone: function (clonedDoc) {
                console.log(clonedDoc);
            }*/
        });
        const img = canvas.toDataURL('image/png');
        const pngImage = await pdfDoc.embedPng(img);
        page.drawImage(pngImage, {
            x: 0,
            y: 0,
            width: page.getWidth(),
            height: page.getHeight(),
        });
    }

    const pdfBytes = await pdfDoc.save();
    var file = new File([pdfBytes], filename, {
        type: "application/pdf;charset=utf-8",
    });
    saveAs(file);
}


/**
 * 
 * @param {node} dom HTML document to print.
 * @returns An array: [base64 string representing a PDF, total number of pages]
 */
async function printBase64PDF(dom) {
    // browser zoom percentage level on non-retina displays
    // without this value, html2canvas resolution will be the same as
    // one views the form in the browser => can be either blury or pristine.
    const browserZoomLevel = Math.round(window.devicePixelRatio * 100);
    const zoom = 100 / browserZoomLevel + 0.5;    

    const pdfDoc = await PDFDocument.create();
    
    const pages = dom.getElementsByClassName('page');    

    for (let i=0; i<pages.length; i++) {
        const page = pdfDoc.addPage(PageSizes.A4);
        const canvas = await html2canvas(dom.querySelector('#' + pages[i].id), {
            scale: zoom,
            logging: false,/*
            onclone: function (clonedDoc) {
                console.log(clonedDoc);
            }*/
        });
        const img = canvas.toDataURL('image/png');
        const pngImage = await pdfDoc.embedPng(img);
        page.drawImage(pngImage, {
            x: 0,
            y: 0,
            width: page.getWidth(),
            height: page.getHeight(),
        });
    }

    const base64 = await pdfDoc.saveAsBase64();
    //console.log(base64);
    return [base64, pdfDoc.getPageCount()];
}

// ------------------------ 4 DEV --------------------

export const printBase64 = (data) => {
    var winparams = 'dependent=yes,locationbar=no,scrollbars=yes,menubar=yes,'+
    'resizable,screenX=50,screenY=50,width=850,height=1050';

    var htmlPop = '<embed width=100% height=100%'
                + ' type="application/pdf"'
                + ' src="data:application/pdf;base64,'
                + data
                + '"></embed>'; 

    var printWindow = window.open ("", "PDF", winparams);
                        printWindow.document.write (htmlPop);

    setTimeout(function(){ 
        printWindow.print();
    }, 150);
}



/**
 * Example:
 * 
 *      printPreview(pdf_string_in_base64)
 */
export const printPreview = (data, type = 'application/pdf') => {
    let blob = null;
    blob = b64toBlob(data, type);
    const blobURL = URL.createObjectURL(blob);
    const theWindow = window.open(blobURL);
    const theDoc = theWindow.document;
    const theScript = document.createElement('script');
    function injectThis() {
        window.print();
        theWindow.close();
    }
    theScript.innerHTML = `window.onload = ${injectThis.toString()};`;
    theDoc.body.appendChild(theScript);

};

const b64toBlob = (content, contentType) => {
    contentType = contentType || '';
    const sliceSize = 512;
     // method which converts base64 to binary
    const byteCharacters = window.atob(content); 

    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    const blob = new Blob(byteArrays, {
        type: contentType
    }); // statement which creates the blob
    return blob;
};

