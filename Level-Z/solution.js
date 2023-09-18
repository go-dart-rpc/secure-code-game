//
const express = require("express");
const bodyParser = require("body-parser");
const libxmljs = require("libxmljs");
const multer = require("multer");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.text({ type: "application/xml" }));

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/ufo/upload", upload.single("file"), (req, res) => {
  return res.status(501).send("Not Implemented."); // We don't need this feature, E.T. created a backdoor!
});

app.post("/ufo", (req, res) => {
  const contentType = req.headers["content-type"];

  if (contentType === "application/json") {
    console.log("Received JSON data:", req.body);
    res.status(200).json({ ufo: "Received JSON data from an unknown planet." });
  } else if (contentType === "application/xml") {
    try {

      xmlDataSanitized = req.body.replace("<!DOCTYPE", ''); // Remove any DOCTYPE occurence
      xmlDataSanitized = req.body.replace("CDATA", ''); // Remove any CDATA occurence
      const xmlDoc = libxmljs.parseXml(xmlData, {
        replaceEntities: false,
        recover: false,
        nonet: true, // No need to access network
        noent: false,
        // replaceEntities: false, // Don't replace XML entities
        // recover: false,
        // nonet: true,
        // noent: true,
      });

      console.log("Received XML data from XMLon:", xmlDoc.toString());

      const extractedContent = [];

      xmlDoc
        .root()
        .childNodes()
        .forEach((node) => {
          if (node.type() === "element") {
            extractedContent.push(node.text());
          }
        });

      if (
        xmlDoc.toString().includes('SYSTEM "') &&
        xmlDoc.toString().includes(".admin")
      ) {
        res.status(400).send("Invalid XML"); // Don't execute anything
      } else {
        res
          .status(200)
          .set("Content-Type", "text/plain")
          .send(extractedContent.join(" "));
      }
    } catch (error) {
      console.error("XML parsing or validation error");
      res.status(400).send("Invalid XML");
    }
  } else {
    res.status(405).send("Unsupported content type");
  }
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = server;
