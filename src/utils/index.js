import axios from "axios";
var similarity = require("compute-cosine-similarity");

export const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const apiRequest = async (
  endpoint,
  { method = "post", params = {} } = {}
) => {
  try {
    return await axios[method](endpoint, params);
  } catch (error) {
    return { error };
  }
};

export const calculateManhattanDistance = data => {
  if (!data.original.length || !data.paraphrased.length) {
    return "NA";
  }

  // debugger;
  const originalData = {};
  data.original.forEach(
    ({ link, position }) => (originalData[link] = position)
  );

  let notFoundIndex = 0;
  const paraphraseData = {};
  for (let index = 0; index < data.paraphrased.length; index++) {
    const { link } = data.paraphrased[index];
    if (!originalData[link]) {
      paraphraseData[link] = notFoundIndex;
      // notFoundIndex;
      continue;
    }
    paraphraseData[link] = originalData[link];
  }
  const oArray = Object.values(originalData);
  let pArray = Object.values(paraphraseData);
  if (oArray.length < pArray.length) {
    pArray.splice(oArray.length);
  } else if (pArray.length < oArray.length) {
    pArray.push(
      ...[...Array(oArray.length - pArray.length).keys()].map(
        i => notFoundIndex
      )
    );
  }

  console.log("==Original Array==", oArray);
  console.log("==Paraphraase Array==", pArray);
  const similar = similarity(oArray, pArray);
  return (isNaN(similar) ? 0 : (similar * 100).toFixed(2)) + "%";
};
