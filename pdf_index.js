const axios = require("axios").default;
const jsreport = require("jsreport")();
const fs = require("fs");
const path = require("path");

async function _main() {
    jsreport
        .init()
        .then(() => {
            jsreport
                .render({
                    template: {
                        content: fs.readFileSync(path.join("master.html"), "utf8"),
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
                    data: { data: json }
                })
                .then(resp => {
                    // write report buffer to a file
                    fs.writeFileSync("report.pdf", resp.content);
                });
        })
        .catch(e => {
            console.log(e);
        });
}

_main();

const json = [
    {
        id: 1,
        name: "شركة النقل البري",
        waybills: [
            {
                wn: "202000001",
                tn: "6012254",
                trn: "7155485"
            },
            {
                wn: "202000002",
                tn: "6022585",
                trn: "719963"
            },
            {
                wn: "202000003",
                tn: "6099854",
                trn: "714525"
            }
        ]
    },
    {
        id: 2,
        name: "القواسمي للنقل المشترك",
        waybills: [
            {
                wn: "202000004",
                tn: "609985",
                trn: "71452"
            },
            {
                wn: "202000005",
                tn: "602104",
                trn: "713265"
            }
        ]
    },
    {
        id: 3,
        name: "شركة مدارج لخدمات النقل العام المشترك الشديد العتيد",
        waybills: [
            {
                wn: "202000006",
                tn: "609985",
                trn: "71452"
            },
            {
                wn: "202000007",
                tn: "602201",
                trn: "713265"
            },
            {
                wn: "202000008",
                tn: "601485",
                trn: "71458"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            },
            {
                wn: "202000009",
                tn: "60124",
                trn: "715258"
            }
        ]
    }
];