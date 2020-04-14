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

const titleLinkCombo = (title, link) => {
  const hostname = new URL(link).hostname || link;
  return `${title.toLowerCase().trim().slice(0, 40)}-${hostname}`;
};

export const findLink = (data, link, title) => {
  return data.filter(
    (search) =>
      titleLinkCombo(search.title, search.link) === titleLinkCombo(title, link)
  );
};

export const calculateManhattanDistance = (data) => {
  if (!data.original.length || !data.paraphrased.length) {
    return "NA";
  }

  const { originalData, paraphraseData } = checkMatches(
    data.paraphrased,
    data.original
  );

  const oArray = Object.values(originalData);
  let pArray = Object.values(paraphraseData);
  if (oArray.length < pArray.length) {
    // check is there matches?
    let i = 0;
    for (const key in originalData) {
      if (originalData[key]) {
        console.log(paraphraseData[key], i);
        pArray[i] = paraphraseData[key];
      }
      i++;
    }
    pArray.splice(oArray.length);
  } else if (pArray.length < oArray.length) {
    pArray.push(
      ...[...Array(oArray.length - pArray.length).keys()].map((i) => 0)
    );
  }

  console.log("==Original Array==", oArray);
  console.log("==Paraphraase Array==", pArray);
  const similar = similarity(oArray, pArray);
  return (isNaN(similar) ? 0 : (similar * 100).toFixed(2)) + "%";
};

function checkMatches(paraphrased, original) {
  const originalData = {};
  original.forEach(({ link, position }) => (originalData[link] = 1));

  const paraphraseData = {};
  for (let index = 0; index < paraphrased.length; index++) {
    const { link, position, title } = paraphrased[index];
    const anyOriginal = findLink(original, link, title);
    if (!anyOriginal.length) {
      paraphraseData[link] = 0;
      continue;
    }
    paraphraseData[link] = 1;
    const originalFound = anyOriginal[0];
    if (originalFound && originalFound.position === position) {
      originalData[link] = 1.3;
    }
  }

  return { originalData, paraphraseData };
}
