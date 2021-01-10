const fs = require("fs");
const Excel = require("exceljs");
const jsreport = require("jsreport");
const path = require("path");
const { Storage } = require("@google-cloud/storage");
const storage = new Storage();
const bucket = storage.bucket("menagate_photos");
// --------------------------------------------------------------------------------------------- //
//          downloads the generate excel file and removes files older than 10 minutes
// --------------------------------------------------------------------------------------------- //
const getXLS = (req, res) => {
  res.download("temp/" + req.query.fileName);
  fs.readdir((dirPath = "temp/"), function (err, files) {
    if (err) return console.log(err);
    files.forEach(function (file) {
      var filePath = dirPath + file;
      fs.stat(filePath, function (err, stat) {
        if (err) return console.log(err);
        var livesUntil = new Date();
        livesUntil.setMinutes(livesUntil.getMinutes());
        if (livesUntil.getTime() - stat.ctime.getTime() > 600000) {
          fs.unlink(filePath, function (err) {
            if (err) return console.log(err);
          });
        }
      });
    });
  });
};

// --------------------------------------------------------------------------------------------- //
//                              generate excel file and save it to temp
// --------------------------------------------------------------------------------------------- //

function generateXls(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  const workbook = new Excel.Workbook();
  const data = req.body.data;
  const company_name = req.body.data.company_name;
  const logo_name = req.body.data.logo_name;
  const rows = data.rows;
  const columns = data.columns;
  const values = columns.map((el) => el.header);
  const sheet = workbook.addWorksheet("تقرير");
  const styleFontSize = req.body.data.cell_font_size;
  columns.unshift({ header: "#", key: "id", width: 10 });
  sheet.views = [{ rightToLeft: true, showGridLines: false }];
  // -----------------ADD LOGO IMAGE -----------------------------------------------
  if(logo_name === "none"){
  }else{
    var logo = workbook.addImage({
      filename: logo_name?logo_name:"logo-small.png",
      extension: "png",
    });
    sheet.addImage(logo, {
      tl: { col: values.length, row: 1 },
      br: { col: values.length + 1, row: 7 },
    });
  }
  sheet.getRow(1).hidden = true;
  //----------------------HEADER MAINTITLE ---------------------------------------
  sheet.getCell("A2").value = company_name?company_name:"شركة مدارج للخدمات اللوجستية";
  if (data.title) {
    sheet.getCell("A3").value = data.title;
  }
  ["A2", "A3"].map((key) => {
    sheet.getCell(key).font = {
      size: 15,
      name: "Calibri",
      family: 2,
      bold: true,
    };
    sheet.getCell(key).alignment = {
      vertical: "middle",
      horizontal: "right",
    };
  });
  sheet.mergeCells("A2", toColumnName(values.length) + "2");
  sheet.mergeCells("A3", toColumnName(values.length) + "3");
  //---------------------HEADER SUBTITLES-----------------------------
  ["A4", "A5", "A6"].map((key) => {
    sheet.getCell(key).font = {
      size: 12,
      name: "Calibri",
      family: 2,
      bold: true,
    };
    sheet.getCell(key).alignment = {
      vertical: "middle",
      horizontal: "right",
    };
  });
  if (data.subtitles) {
    let j = 0;
    for (let index = 4; index < 7; index++) {
      sheet.getCell("A" + index).value = data.subtitles[j];
      j++;
    }
  }
  //--------------COLUMN HEADER---------------------------------------
  sheet.getRow(2).height = 25;
  sheet.getRow(3).height = 25;
  values.unshift("#");
  sheet.getRow(8).values = values;
  let valuesColumn = [];
  for (let index = 1; index < values.length + 1; index++) {
    valuesColumn.push(toColumnName(index) + "8");
  }
  sheet.getRow(8).font = {
    size: 16,
    name: "Calibri",
    family: 2,
    bold: true,
  };
  sheet.getRow(8).alignment = {
    vertical: "middle",
    horizontal: "center",
  };
  valuesColumn.map((key) => {
    sheet.getCell(key).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "cccccc" },
    };
    sheet.getCell(key).border = {
      top: { style: "double", color: { argb: "black" } },
      left: { style: "double", color: { argb: "black" } },
      bottom: { style: "double", color: { argb: "black" } },
      right: { style: "double", color: { argb: "black" } },
    };
  });
  //----------------STYLE COLUMNS ------------------------------------------
  columns.forEach((el) => {
    el.style = {
      ...el.style,
      font: {
        size: styleFontSize ? styleFontSize : 12,
        name: "Calibri",
        family: 2,
      },
      alignment: {
        vertical: "middle",
        horizontal: el.alignment ? el.alignment : "center",
      },
    };
  });
  console.log(columns);
  sheet.columns = columns;
  sheet.getColumn(toColumnName(values.length)).width = 35; //last column
  //-----------ADD ROWS ------------------------------------------------------
  rows.forEach((element, index) => {
    element.id = index + 1;
    sheet.addRow(element);
  });
  let rowCells = [];
  for (let index = 1; index < values.length + 1; index++) {
    for (let j = 9; j < rows.length + 9; j++) {
      rowCells.push(toColumnName(index) + j);
    }
  }
  rowCells.map((key) => {
    sheet.getCell(key).border = {
      top: { style: "hair", color: { argb: "black" } },
      left: { style: "hair", color: { argb: "black" } },
      bottom: { style: "hair", color: { argb: "black" } },
      right: { style: "hair", color: { argb: "black" } },
    };
  });
  //-------------------FOOTER --------------------------------------
  sheet.getCell("A" + (rows.length + 9)).value =
    " التاريخ :" +
    new Date().getFullYear() +
    "-" +
    (new Date().getMonth() + 1) +
    "-" +
    new Date().getDate() +
    " " +
    new Date().getHours() +
    ":" +
    new Date().getMinutes();
  if (data.user_id) {
    sheet.getCell("A" + (rows.length + 10)).value =
      " طبع بواسطة : " + data.user_id;
  }
  ["A" + (rows.length + 9), "A" + (rows.length + 10)].map((key) => {
    sheet.getCell(key).font = {
      size: 12,
      name: "Calibri",
      family: 2,
      bold: true,
    };
    sheet.getCell(key).alignment = {
      vertical: "middle",
      horizontal: "right",
    };
  });
  sheet.mergeCells(
    "A" + (rows.length + 9),
    toColumnName(values.length) + (rows.length + 9)
  );
  sheet.mergeCells(
    "A" + (rows.length + 10),
    toColumnName(values.length) + (rows.length + 10)
  );
  //------------------------GENERATE FILE-------------------------------
  let filename = Math.random();
  workbook.xlsx
    .writeFile("temp/" + filename + ".XLSX")
    .then(function () {
      console.log("done");
      res.send(filename.toString());
    })
    .catch((ex) => {
      console.log(ex);
    });
}

// --------------------------------------------------------------------------------------------- //
//                           renders the report and calls upload to firebase
// --------------------------------------------------------------------------------------------- //
const generateReport = (res, params, req, template) => {
  try {
    jsreport
      .render({
        template: {
          content: fs.readFileSync(path.join("./tmp/"+template), "utf8"),
          recipe: "chrome-pdf",
          engine: "handlebars",

          chrome: {
            timeout: 3000000,
            headerTemplate:
              "<div style='text-align:center'>{#pageNum}/{#numPages}</div>",
            width: "800px",
            marginTop: "1cm",
            marginLeft: "1cm",
            launchOptions: {
              timeout: 3000000,
            },
          },
        },
        data: params,
      })
      .then((out) => {
        res.send(out.content.toString("base64"));
        // uploadToFirebase(out.content.toString('base64'), res)
      })
      .catch((e) => {
        res.end(e.message);
      });
  } catch (err) {
    console.log(err);
  }
};

const generatePdfReport = (req, res) => {
  let buffer = "";
    bucket
      .file(req.body.type + ".html")
      .download()
      .then(async v => {
        const resp = await jsreport.render({
          template: {
            content: v.toString(),
            engine: "handlebars",
            recipe: "chrome-pdf",
            chrome: {
              headerTemplate: "<div style='text-align:center'>Header</div>",
              width: "800px",
              marginTop: "1cm",
              marginLeft: "1cm",
            },
          },
          data:req.body
        });
        // write report buffer to a file
        res.writeHead(200, {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="filename.pdf"',
        });
        const download = Buffer.from(resp.content.toString("base64"), "base64");
        res.end(download);
      })
      
};

module.exports = {
  getXLS,
  generatePdfReport,
  generateReport,
  generateXls
};
