const http = require('http');
const jsreport = require('jsreport');
const pdfUtils = require("jsreport-pdf-utils")
var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path');
var router = express.Router()
var request = require('request');
var https = require("https");
const Excel = require('exceljs');
//app.use(express.json());


app.timeout = 2000000; // about 30 minutes
console.log("server is running")
var bodyParser = require('body-parser');

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: false }));

//--------------------------------------------------------------------------
//                  SETS HEADERS
//--------------------------------------------------------------------------
app.use((req, res, next) => {
  res.append('Access-Control-Allow-Origin', ['*']);
  res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.append('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
//--------------------------------------------------------------------------
//                  UPLOADS TO FIREBASE
//--------------------------------------------------------------------------
function uploadToFirebase(data, res) {
  try {
    let url = "https://us-central1-waybill-project.cloudfunctions.net//storePdf2";

    let temp = {
      image: data

    }
    body = temp
    request({
      url: url,
      method: "POST",
      json: true,
      body: temp,

    }, function (error, response, body) {
      res.send(response)
    });
  }
  catch (error) {
    console.log(error)
  }
}
//---------------------------------------------------------------------------------
//          RECIEVES REQUESTS AND ROUTES THEM TO THEIR RESPECTIVE HANDLERS
//---------------------------------------------------------------------------------

app.get('/', function (req, res) {

  res.send('Reporting Server');
});

app.post('/generateReport', function (req, res) {
  let params = req.body.data;

  // if (req.body.logo) {
  //   try {
  //     logo = JSON.parse(req.body.logo)
  //     body = JSON.parse(req.body.data)
  //     body.logo = logo
  //     body = JSON.stringify(body)
  //     params = body
  //     params.logo = req.body.logo
  //   }
  //   catch (error) {
  //     console.log(err)
  //   }
  // }

  params.json = req.body.data
  let template = req.body.template + '.html'
  generateReport(res, params, req, template);
});


app.post('/generateXls', function (req, res) {
  generateXls(req, res);
});

app.get('/getXls', function (req, res) {
  getXLS(req, res)
})

// --------------------------------------------------------------------------------------------- //
//          downloads the generate excel file and removes files older than 10 minutes
// --------------------------------------------------------------------------------------------- //
function getXLS(req, res) {

  console.log(req.query.fileName)
  res.download('temp/' + req.query.fileName)
  fs.readdir(dirPath = 'temp/', function (err, files) {
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
}

// ------------------------------------------------------------------- //
// ----------------------- generatePdfReport ------------------------ //
// ------------------------------------------------------------------ //

app.post('/generatePdfReport', function (req, res) {
console.log("hereeeeeeeeeeeeeeeeeeeeeee")
  if (req.body.type == "injaz_template") {
    jsreport
      .render({
        template: {
          content: fs.readFileSync(path.join("./pdfTemplates/injazVoucher.html"), "utf8"),
          engine: "handlebars",
          recipe: "chrome-pdf",
          helpers: fs.readFileSync(path.join("helpers.js"), "utf8"),
          chrome: {
            headerTemplate: "<div style='text-align:center'>{#pageNum}/{#numPages}</div>",
            width: "210mm",
            height:'148mm',
            marginLeft: "1.1cm",
            marginTop:"0.5cm"
          }
        },
        data: { 
          voucher_date: req.body.voucher_date,
          voucher_id:req.body.voucher_id,
          driver_name:req.body.driver_name,
          amount:req.body.amount,
          clearing_agent_cont_num:req.body.clearing_agent_cont_num,
          operation_type:req.body.operation_type,
          before_fraction:req.body.before_fraction,
          after_fraction:req.body.after_fraction,
          driver_nn:req.body.driver_nn,
          tn:req.body.truckNumber
         },
      })
      .then(resp => {

        // write report buffer to a file
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="filename.pdf"'
        });
        const download = Buffer.from(resp.content.toString('base64'), 'base64');
        res.end(download)
      });
  }

  if (req.body.type == "silk_road_voucher") {
    jsreport
      .render({
        template: {
          content: fs.readFileSync(path.join("./pdfTemplates/silk_road_voucher.html"), "utf8"),
          engine: "handlebars",
          recipe: "chrome-pdf",
          helpers: fs.readFileSync(path.join("helpers.js"), "utf8"),
          chrome: {
            headerTemplate: "<div style='text-align:center'>{#pageNum}/{#numPages}</div>",
            width: "210mm",
            height:'148mm',
            marginLeft: "1.1cm",
            marginTop:"0.5cm"
          }
        },
        data: { 
          voucher_date: req.body.voucher_date,
          voucher_id:req.body.voucher_id,
          driver_name:req.body.driver_name,
          amount:req.body.amount,
          clearing_agent_cont_num:req.body.clearing_agent_cont_num,
          operation_type:req.body.operation_type,
          before_fraction:req.body.before_fraction,
          after_fraction:req.body.after_fraction,
          driver_nn:req.body.driver_nn,
          tn:req.body.truckNumber,
          payment_method: req.body.payment_method,
          from_account_name:req.body.from_account_name,
          payment_commission:req.body.payment_commission
         },
      })
      .then(resp => {

        // write report buffer to a file
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="filename.pdf"'
        });
        const download = Buffer.from(resp.content.toString('base64'), 'base64');
        res.end(download)
      });
  }

  if (req.body.type == "trail_balance") {
    console.log('req.body.data',req.body.logo)
    jsreport
      .render({
        template: {
          content: fs.readFileSync(path.join("./pdfTemplates/trailBalance.html"), "utf8"),
          engine: "handlebars",
          recipe: "chrome-pdf",
          helpers: fs.readFileSync(path.join("helpers.js"), "utf8"),
          chrome: {
            headerTemplate: "<div style='text-align:center'>{#pageNum}/{#numPages}</div>",
            width: "800px",
            marginTop: "1cm",
            marginLeft: "1cm"
          }
        },
        data: { category: req.body.category,companyName:req.body.companyName,dateRe:req.body.date,logo:req.body.logo },
      })
      .then(resp => {

        // write report buffer to a file
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="filename.pdf"'
        });
        const download = Buffer.from(resp.content.toString('base64'), 'base64');
        res.end(download)
      });
  }
  if (req.body.type == "tender_claim") {
    jsreport
      .render({
        template: {
          // content: fs.readFileSync(path.join("master.html"), "utf8"),
          content: fs.readFileSync(path.join("./pdfTemplates/tender_claim.html"), "utf8"),
          engine: "handlebars",
          recipe: "chrome-pdf",
          helpers: fs.readFileSync(path.join("helpers.js"), "utf8"),
          chrome: {
            headerTemplate: "<div style='text-align:center'>{#pageNum}/{#numPages}</div>",
            width: "800px",
            marginTop: "1cm",
            marginLeft: "1cm"
          }
        },
        data: { data: req.body.data }
      })
      .then(resp => {

        // write report buffer to a file
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="filename.pdf"'
        });
        const download = Buffer.from(resp.content.toString('base64'), 'base64');
        res.end(download)
      });
  }

  if (req.body.type == "trucking_company_waybill") {
    jsreport
      .render({
        template: {
          // content: fs.readFileSync(path.join("master.html"), "utf8"),
          content: fs.readFileSync(path.join("./pdfTemplates/trucking_company_waybill.html"), "utf8"),
          engine: "handlebars",
          recipe: "chrome-pdf",
          helpers: fs.readFileSync(path.join("helpers.js"), "utf8"),
          chrome: {
            headerTemplate: "<div style='text-align:center'>{#pageNum}/{#numPages}</div>",
            width: "800px",
            marginTop: "1cm",
            marginLeft: "1cm"
          }
        },
        data: { data: req.body.data }
      })
      .then(resp => {
        // write report buffer to a file
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="filename.pdf"'
        });
        const download = Buffer.from(resp.content.toString('base64'), 'base64');
        res.end(download)
      });
  }

  if (req.body.type == "tender_claim_template") {
    jsreport
      .render({
        template: {
          // content: fs.readFileSync(path.join("master.html"), "utf8"),
          content: fs.readFileSync(path.join("./pdfTemplates/tender_claim_template.html"), "utf8"),
          engine: "handlebars",
          recipe: "chrome-pdf",
          helpers: fs.readFileSync(path.join("helpers.js"), "utf8"),
          chrome: {
            headerTemplate: "<div style='text-align:center'>{#pageNum}/{#numPages}</div>",
            width: "800px",
            marginTop: "1cm",
            marginLeft: "1cm"
          }
        },
        data: { data: req.body.data }
      })
      .then(resp => {
        // write report buffer to a file
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="filename.pdf"'
        });
        const download = Buffer.from(resp.content.toString('base64'), 'base64');
        res.end(download)
      });
  }


  if (req.body.type == "check") {
    jsreport
      .render({
        template: {
          // content: fs.readFileSync(path.join("master.html"), "utf8"),
          content: fs.readFileSync(path.join("./pdfTemplates/check.html"), "utf8"),
          engine: "handlebars",
          recipe: "chrome-pdf",
          helpers: fs.readFileSync(path.join("helpers.js"), "utf8"),
          chrome: {
            headerTemplate: "<div style='text-align:center'>{#pageNum}/{#numPages}</div>",
            width: "166mm",
            height: "83mm",
            marginTop: "1cm",
            marginLeft: "1cm"
          }
        },
        data: { data: req.body.data }
      })
      .then(resp => {
        // write report buffer to a file
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="filename.pdf"'
        });
        const download = Buffer.from(resp.content.toString('base64'), 'base64');
        res.end(download)
      });
  }

  if (req.body.type == "voucher") {
    jsreport
      .render({
        template: {
          // content: fs.readFileSync(path.join("master.html"), "utf8"),
          content: fs.readFileSync(path.join("./pdfTemplates/voucher.html"), "utf8"),
          engine: "handlebars",
          recipe: "chrome-pdf",
          helpers: fs.readFileSync(path.join("helpers.js"), "utf8"),
          chrome: {
            headerTemplate: "<div style='text-align:center'>{#pageNum}/{#numPages}</div>",
            width: "800px",
            marginTop: "1cm",
            marginLeft: "1cm"
          }
        },
        data: { data: req.body.data }
        // data:req.body.data 

      })
      .then(resp => {
        // write report buffer to a file
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="filename.pdf"'
        });
        const download = Buffer.from(resp.content.toString('base64'), 'base64');
        res.end(download)
      });
  }

  if(req.body.type == "transacton_acc"){
    jsreport
      .render({
        template: {
          // content: fs.readFileSync(path.join("master.html"), "utf8"),
          content: fs.readFileSync(path.join("./pdfTemplates/transacton_acc_template.html"), "utf8"),
          engine: "handlebars",
          recipe: "chrome-pdf",
          helpers: fs.readFileSync(path.join("helpers.js"), "utf8"),
          chrome: {
            headerTemplate: "<div style='text-align:center'>{#pageNum}/{#numPages}</div>",
            width: "800px",
            marginTop: "1cm",
            marginLeft: "1cm"
          }
        },
        data: { data: req.body.data ,
                totalData: req.body.totalData,
                create_date:req.body.create_date,
                jv_id:req.body.jv_id,
                print_date:req.body.print_date,
                companyName:req.body.companyName,
                printer_name:req.body.printer_name}
      })
      .then(resp => {
        // write report buffer to a file
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="filename.pdf"'
        });
        const download = Buffer.from(resp.content.toString('base64'), 'base64');
        res.end(download)
      });
  }
  if(req.body.type == "close_cash_box"){
    jsreport
      .render({
        template: {
          // content: fs.readFileSync(path.join("master.html"), "utf8"),
          content: fs.readFileSync(path.join("./pdfTemplates/closeCashBox.html"), "utf8"),
          engine: "handlebars",
          recipe: "chrome-pdf",
          helpers: fs.readFileSync(path.join("helpers.js"), "utf8"),
          chrome: {
            headerTemplate: "<div style='text-align:center'>{#pageNum}/{#numPages}</div>",
            width: "800px",
            marginTop: "1cm",
            marginLeft: "1cm"
          }
        },
        data: { data: req.body.data ,
                report_date:req.body.date,
                closing_balance:req.body.closing_balance,
                starting_balance:req.body.starting_balance,
                accountName:req.body.accountName,
                print_date:req.body.print_date,
                companyName:req.body.companyName,
                total_credit:req.body.total_credit,
                total_debit:req.body.total_debit,
                printer_name:req.body.printer_name,
                reportName:req.body.reportName},

      })
      .then(resp => {
        // write report buffer to a file
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="filename.pdf"'
        });
        const download = Buffer.from(resp.content.toString('base64'), 'base64');
        res.end(download)
      });
  }
  if (req.body.type == "tender_claim_excel") {
    jsreport
      .render({
        template: {
          // content: fs.readFileSync(path.join("master.html"), "utf8"),
          content: fs.readFileSync(path.join("./pdfTemplates/tender_claim_excel.html"), "utf8"),
          engine: "handlebars",
          recipe: "chrome-pdf",
          helpers: fs.readFileSync(path.join("helpers.js"), "utf8"),
          chrome: {
            headerTemplate: "<div style='text-align:center'>{#pageNum}/{#numPages}</div>",
            width: "1500px",
            marginTop: "1cm",
            marginLeft: "1cm",
          }
        },
        data: { data: req.body.data, titleData: req.body.titleData, totalData: req.body.totalData,print_date:req.body.print_date,cargo_name:req.body.cargo_name },
      })
      .then(resp => {
        // write report buffer to a file
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="filename.pdf"'
        });
        const download = Buffer.from(resp.content.toString('base64'), 'base64');
        res.end(download)
      });
  }

  if (req.body.type == "phosphate_report") {
    jsreport
      .render({
        template: {
          // content: fs.readFileSync(path.join("master.html"), "utf8"),
          content: fs.readFileSync(path.join("./pdfTemplates/phospateReport.html"), "utf8"),
          engine: "handlebars",
          recipe: "chrome-pdf",
          helpers: fs.readFileSync(path.join("helpers.js"), "utf8"),
          chrome: {
            headerTemplate: "<div style='text-align:center'>{#pageNum}/{#numPages}</div>",
            width: "1500px",
            marginTop: "1cm",
            marginLeft: "1cm",
          }
        },
        data: { 
          data: req.body.data,
          titleData: req.body.titleData,
          totalData: req.body.totalData,
          print_date:req.body.print_date,
          from_date:req.body.from_date,
          to_date:req.body.to_date,
          cargo_name:req.body.cargo_name },
      })
      .then(resp => {
        // write report buffer to a file
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="filename.pdf"'
        });
        const download = Buffer.from(resp.content.toString('base64'), 'base64');
        res.end(download)
      });
  }

});


// --------------------------------------------------------------------------------------------- //
//                              generate excel file and save it to temp
// --------------------------------------------------------------------------------------------- //
function generateXls(req, res) {

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");

  const workbook = new Excel.Workbook();
  const data = req.body.data
  const rows = data.rows;
  const columns = data.columns;
  const values = columns.map(el => el.header);
  const sheet = workbook.addWorksheet("تقرير");
  const styleFontSize = req.body.data.cell_font_size
  columns.unshift({ header: "#", key: "id", width: 10 });

  sheet.views = [
    { rightToLeft: true, showGridLines: false }
  ];


  // -----------------ADD LOGO IMAGE -----------------------------------------------
  var logo = workbook.addImage({
    filename: 'logo-small.png',
    extension: 'png',
  });
  sheet.addImage(logo, {
    tl: { col: values.length, row: 1 },
    br: { col: values.length + 1, row: 7 }
  });
  sheet.getRow(1).hidden = true


  //----------------------HEADER MAINTITLE ---------------------------------------
  sheet.getCell('A2').value = "شركة مدارج للخدمات اللوجستية"
  if (data.title) {
    sheet.getCell('A3').value = data.title
  }
  ['A2', 'A3'].map(key => {
    sheet.getCell(key).font = {
      size: 15,
      'name': 'Calibri',
      'family': 2,
      'bold': true
    };
    sheet.getCell(key).alignment = {
      vertical: 'middle',
      horizontal: 'right',
    }
  });

  sheet.mergeCells('A2', toColumnName(values.length) + "2");
  sheet.mergeCells('A3', toColumnName(values.length) + "3");

  //---------------------HEADER SUBTITLES-----------------------------
  ['A4', 'A5', 'A6'].map(key => {
    sheet.getCell(key).font = {
      size: 12,
      'name': 'Calibri',
      'family': 2,
      'bold': true
    };
    sheet.getCell(key).alignment = {
      vertical: 'middle',
      horizontal: 'right',
    }
  });
  if (data.subtitles) {
    let j = 0;
    for (let index = 4; index < 7; index++) {
      sheet.getCell('A' + index).value = data.subtitles[j]
      j++;
    }
  }




  //--------------COLUMN HEADER---------------------------------------

  sheet.getRow(2).height = 25;
  sheet.getRow(3).height = 25;
  values.unshift("#");
  sheet.getRow(8).values = values;
  let valuesColumn = []
  for (let index = 1; index < values.length + 1; index++) {
    valuesColumn.push(toColumnName(index) + "8")
  }
  sheet.getRow(8).font = {
    size: 16,
    'name': 'Calibri',
    'family': 2,
    'bold': true
  };
  sheet.getRow(8).alignment = {
    vertical: 'middle',
    horizontal: 'center',
  }
  valuesColumn.map(key => {
    sheet.getCell(key).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'cccccc' }
    };
    sheet.getCell(key).border = {
      top: { style: 'double', color: { argb: 'black' } },
      left: { style: 'double', color: { argb: 'black' } },
      bottom: { style: 'double', color: { argb: 'black' } },
      right: { style: 'double', color: { argb: 'black' } }
    }
  });

  //----------------STYLE COLUMNS ------------------------------------------ 

  columns.forEach((el) => {
    el.style = {
      ...el.style,
      font: {
        size: styleFontSize ? styleFontSize :12,
        'name': 'Calibri',
        'family': 2,
      },
      alignment: {
        vertical: 'middle',
        horizontal: el.alignment ? el.alignment : "center",
      }
    }
  })

  console.log(columns)
  sheet.columns = columns;
  sheet.getColumn(toColumnName(values.length)).width = 35; //last column 


  //-----------ADD ROWS ------------------------------------------------------ 
  rows.forEach((element, index) => {

    element.id = index + 1
    sheet.addRow(element);

  });

  let rowCells = []
  for (let index = 1; index < values.length + 1; index++) {
    for (let j = 9; j < rows.length + 9; j++) {
      rowCells.push(toColumnName(index) + j)
    }
  }
  rowCells.map(key => {
    sheet.getCell(key).border = {
      top: { style: 'hair', color: { argb: 'black' } },
      left: { style: 'hair', color: { argb: 'black' } },
      bottom: { style: 'hair', color: { argb: 'black' } },
      right: { style: 'hair', color: { argb: 'black' } }
    }

  })
  //-------------------FOOTER --------------------------------------
  sheet.getCell('A' + (rows.length + 9)).value = ' التاريخ :' + new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate() + ' ' + new Date().getHours() + ':' + new Date().getMinutes()
  if (data.user_id) {
    sheet.getCell('A' + (rows.length + 10)).value = " طبع بواسطة : " + data.user_id;
  }
  ['A' + (rows.length + 9), 'A' + (rows.length + 10)].map(key => {
    sheet.getCell(key).font = {
      size: 12,
      'name': 'Calibri',
      'family': 2,
      'bold': true
    };
    sheet.getCell(key).alignment = {
      vertical: 'middle',
      horizontal: 'right',
    }
  });
  sheet.mergeCells('A' + (rows.length + 9), toColumnName(values.length) + (rows.length + 9));
  sheet.mergeCells('A' + (rows.length + 10), toColumnName(values.length) + (rows.length + 10));




  //------------------------GENERATE FILE-------------------------------
  let filename = Math.random()
  workbook.xlsx.writeFile('temp/' + filename + '.XLSX')
    .then(function () {
      console.log('done');
      res.send(filename.toString())

    }).catch(ex => {
      console.log(ex);
    });
}

// --------------------------------------------------------------------------------------------- //
//                           renders the report and calls upload to firebase
// --------------------------------------------------------------------------------------------- //
function generateReport(res, params, req, template) {
  try {
    jsreport.render({
      template: {
        content: fs.readFileSync(path.join(template), 'utf8'),
        recipe: "chrome-pdf",
        engine: "handlebars",

        chrome: {
          timeout: 3000000,
          headerTemplate: "<div style='text-align:center'>{#pageNum}/{#numPages}</div>",
          width: "800px",
          "marginTop": "1cm",
          "marginLeft": "1cm",
          launchOptions: {
            timeout: 3000000,
          }
        }
      },
      data: params,
    }).then((out) => {
      res.send(out.content.toString('base64'))
      // uploadToFirebase(out.content.toString('base64'), res)
    }).catch((e) => {
      res.end(e.message);
    });
  }
  catch (err) {
    console.log(err)
  }
}

function toColumnName(num) {
  for (var ret = '', a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
    ret = String.fromCharCode(parseInt((num % b) / a) + 65) + ret;
  }
  return ret;
}

app.listen(3000)