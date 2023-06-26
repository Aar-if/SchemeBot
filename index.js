const express = require("express");
const app = express();
const axios = require("axios");
const cors = require("cors");
const port = 3000;

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

app.get("/multilang", async (req, res) => {
  const requestData = req;
  // console.log(requestData);
  console.log("ENTERED INTO FIRST API CALL FOR LANGUAGE CONERSION");
  await axios
    .post("	https://demo-api.models.ai4bharat.org/inference/translation/v2", {
      controlConfig: { dataTracking: true },
      input: [
        {
          source:
            "मैं किरण हूं. मैं 10वीं कक्षा में पढ़ने वाले एक बच्चे का माता-पिता हूं। मेरी सालाना आय 2.4 लाख रुपये सालाना है. मेरे लिए कौन सी योजनाएँ उपलब्ध हैं?",
        },
      ],
      config: {
        serviceId: "",
        language: {
          sourceLanguage: "hi",
          targetLanguage: "en",
          targetScriptCode: null,
          sourceScriptCode: null,
        },
      },
    })
    .then(async (response) => {
      const responseData = response.data;
      res.json(responseData);
      console.log(responseData);
      console.log("CONVERTED FROM INDIC TO ENGLISH");
      console.log(responseData.output[0].target);
      console.log(
        "ENTERED INTO SECOND API CALL WHICH WILL SEND CONVERTED ENGLISH DATA TO JUGALBANDI"
      );
      await axios
        .get("http://4.240.112.55:8000/query-with-gptindex", {
          params: {
            uuid_number: "effc6ca6-1181-11ee-9884-0242ac110002",
            query_string: responseData.output[0].target,
          },
          headers: {
            accept: "application/json",
          },
        })
        .then(async (response) => {
          const responseData = response.data.answer;
          console.log("GOT THE SECOND API RESPONSE FROM JUGALBANDI IN ENGLISH");
          console.log(responseData);
          console.log(
            "ENTERED INTO THIRD API CALL TO CONVERT THE ENGLISH RESPONSE BACK TO INDIC LANGUAGE"
          );
          await axios
            .post(
              "https://demo-api.models.ai4bharat.org/inference/translation/v2",
              {
                controlConfig: { dataTracking: true },
                input: [
                  {
                    source: responseData,
                  },
                ],
                config: {
                  serviceId: "",
                  language: {
                    sourceLanguage: "en",
                    targetLanguage: "hi",
                    targetScriptCode: null,
                    sourceScriptCode: null,
                  },
                },
              }
            )
            .then(async (response) => {
              const responseData = response.data;
              console.log("GOT THE THIRD API RESPONSE IN INDIC LANGUAGE");
              console.log(responseData.output[0].target);
            });
        });
    })
    .catch((error) => {
      console.error("Error fetching data from the other API:", error);
      res.status(500).json({ error: "An error occurred" });
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
