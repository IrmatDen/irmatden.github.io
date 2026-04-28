// pdf-worker.js

onmessage = function(e) {
    const { expertise, marks, signs, name, concept, player, campaign, portrait, area, sheetGraphic } = e.data;

    importScripts('https://cdnjs.cloudflare.com/ajax/libs/jspdf/3.0.1/jspdf.umd.min.js');
    importScripts('./Ink Free-normal.js');

    function renderFittedTextToPdf(doc, text, x, y, maxWidth, textOpts) {
        textOpts = textOpts || {};
        const fntS = doc.getFontSize();
        const unitWidth = doc.getStringUnitWidth(text);
        const unitWidthMM = unitWidth / (72/25.4); // convert from inches to mm

        var w = unitWidthMM * fntS;
        if (w > maxWidth) {
            doc.setFontSize(maxWidth / unitWidthMM);
        }

        doc.text(text, x, y, textOpts);
        doc.setFontSize(fntS);
    }

    function genPdf() {
        const doc = new jspdf.jsPDF({ orientation: "landscape", format: "a4", unit: "mm" });

        const imgSpecs = {
            x: 8,
            y: 60,
            width: 63,
            height: 92.6
        };
        if (!portrait) {
            doc.addImage("default-fantasy-male-portrait.png", "PNG", imgSpecs.x, imgSpecs.y, imgSpecs.width, imgSpecs.height, "SLOW");
        } else {
            const props = doc.getImageProperties(portrait);
            
            const zoom = imgSpecs.width / (area.width * props.width);

            var x = imgSpecs.x - zoom * area.x * props.width;
            var y = imgSpecs.y - zoom * area.y * props.height;
            var width = zoom * props.width;
            var height = zoom * props.height;
            doc.addImage(portrait, "PNG", x, y, width, height, "SLOW");
        }

        // Assuming sheetGraphic is preloaded or passed correctly
        doc.addImage(sheetGraphic, "PNG", 0, 0, 297, 210, "", "FAST");
        doc.setFont("Ink Free");

        doc.setFontSize(18);
        expertise.forEach((e, index) => {
            renderFittedTextToPdf(doc, e, 84.5, 151 + index * 15, 206);
        });
        
        doc.setFontSize(16);
        renderFittedTextToPdf(doc, marks[0], 84.5, 199, 206);
        
        doc.setFontSize(18);
        signs.forEach((s, index) => {
            renderFittedTextToPdf(doc, s, 41.6, 181 + index * 9.7, 64, { align: "center" });
        });

        doc.setFontSize(10);
        renderFittedTextToPdf(doc, concept, 89.3, 138.15, 98);

        doc.setFontSize(24);
        renderFittedTextToPdf(doc, name, 39, 162.5, 62, { align: "center" });

        doc.setFontSize(24);
        renderFittedTextToPdf(doc, player, 35, 41.5, 70, { align: "center" });
        
        doc.setFontSize(24);
        renderFittedTextToPdf(doc, campaign, 9.35, 55, 70);

        return doc.output('blob');
    }

    const pdfBlob = genPdf();
    postMessage(pdfBlob);
};