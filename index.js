const express = require("express");
const app = express();
const axios = require("axios");
const cors = require("cors");
const port = 3000;

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

app.get("/multilang", async (req, res) => {
  const requestData = req.query.query_string;
  const inputLang = req.query.inputLanguage;
  const outputLang = req.query.outputLanguage;
  console.log(requestData);
  console.log(inputLang);
  console.log(outputLang);

  console.log("ENTERED INTO FIRST API CALL FOR LANGUAGE CONVERSION");

  // Check if input language is 'en'
  if (inputLang !== "en") {
    await axios
      .post("https://demo-api.models.ai4bharat.org/inference/translation/v2", {
        controlConfig: { dataTracking: true },
        input: [
          {
            source: requestData,
          },
        ],
        config: {
          serviceId: "",
          language: {
            sourceLanguage: inputLang,
            targetLanguage: "en",
            targetScriptCode: null,
            sourceScriptCode: null,
          },
        },
      })
      .then(async (response) => {
        const responseData = response.data;
        console.log(responseData);
        console.log("CONVERTED FROM INDIC TO ENGLISH");
        console.log(responseData.output[0].target);
        makeSecondApiCall(responseData.output[0].target);
      })
      .catch((error) => {
        console.error("Error fetching data from the API 1 :", error);
        res.status(500).json({ error: "An error occurred" });
      });
  } else {
    // Skip first API call, directly make the second API call
    makeSecondApiCall(requestData);
  }

  async function makeSecondApiCall(text) {
    const queryString = `You are a helpful assistant who helps with answering questions based on the provided information. If the information asked cannot be found in the text provided, you admit that I cant find the exact information. Always include application links for each scheme. Here is the question : ${text}`;
    console.log(
      "ENTERED INTO SECOND API CALL WHICH WILL SEND CONVERTED ENGLISH DATA TO JUGALBANDI"
    );
    await axios
      .get("http://4.240.112.55:8000/query-with-gptindex", {
        params: {
          uuid_number: "6df74548-140e-11ee-9884-0242ac110002",
          query_string: queryString,
        },
        headers: {
          accept: "application/json",
        },
      })
      .then(async (response) => {
        const responseData = response.data.answer;
        console.log("GOT THE SECOND API RESPONSE FROM JUGALBANDI IN ENGLISH");
        console.log(responseData);
        makeThirdApiCall(responseData);
      })
      .catch((error) => {
        console.error("Error fetching data from the API 2:", error);
        res.status(500).json({ error: "An error occurred" });
      });
  }

  async function makeThirdApiCall(text) {
    // Check if output language is 'en'
    if (outputLang !== "en") {
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
                source: text,
              },
            ],
            config: {
              serviceId: "",
              language: {
                sourceLanguage: "en",
                targetLanguage: outputLang,
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

          const botResponse = responseData.output[0].target;
          res.json({ answer: botResponse });
        })
        .catch((error) => {
          console.error("Error fetching data from the API 3:", error);
          res.status(500).json({ error: "An error occurred" });
        });
    } else {
      // Skip third API call, directly return the response
      res.json({ answer: text });
    }
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
