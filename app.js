var express = require("express");
var app = express();
var fs = require("fs");
var request = require("request");
const Excel = require("exceljs");
const {getXLS,generateXls,generatePdfReport,generateReport} = require("./helpers")

app.timeout = 2000000; // about 30 minutes
var bodyParser = require("body-parser");
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: false }));

//--------------------------------------------------------------------------
//                  SETS HEADERS
//--------------------------------------------------------------------------
app.use((req, res, next) => {
  res.append("Access-Control-Allow-Origin", ["*"]);
  res.append("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.append("Access-Control-Allow-Headers", "Content-Type");
  next();
});

//---------------------------------------------------------------------------------
//          RECIEVES REQUESTS AND ROUTES THEM TO THEIR RESPECTIVE HANDLERS
//---------------------------------------------------------------------------------

app.get("/", function (req, res) {
  res.send("Reporting Server");
});

app.post("/generateReport", function (req, res) {
  let params = req.body.data;
  params.json = req.body.data;
  let template = req.body.template + ".html";
  generateReport(res, params, req, template);
});

app.post("/generateXls", function (req, res) {
  generateXls(req, res);
});

app.get("/getXls", function (req, res) {
  getXLS(req, res);
});

app.post("/generatePdfReport", function (req, res) {
  generatePdfReport(req,res);
});

app.listen(5000);
