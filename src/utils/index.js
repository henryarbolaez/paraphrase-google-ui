import axios from "axios";
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

function manhattanDistance(p = [], q = []) {
  const pDim = p.length,
    qDim = q.length;

  if (pDim !== qDim) {
    throw new Error("Input not of equal dimension");
  }

  if (pDim === 0) {
    throw new Error("Input should not have dimension zero");
  }

  let result = 0;
  for (let i = 0; i < pDim; i++) {
    result += Math.abs(p[i] - q[i]);
  }

  return result;
}

export const calculateManhattanDistance = data => {
  const originalData = {};
  data.original.forEach(
    ({ link, position }) => (originalData[link] = position)
  );

  let notFoundIndex = data.original.length + 1;
  const paraphraseData = {};
  for (let index = 0; index < data.paraphrased.length; index++) {
    const { link } = data.paraphrased[index];
    if (!originalData[link]) {
      paraphraseData[link] = notFoundIndex;
      notFoundIndex++;
      continue;
    }
    paraphraseData[link] = originalData[link];
  }
  const oArray = Object.values(originalData);
  let pArray = Object.values(paraphraseData);

  if (oArray.length < pArray.length) {
    pArray.splice(oArray.length);
  } else if (pArray.length && pArray.length < oArray.length) {
    pArray.push(
      ...[...Array(oArray.length - pArray.length).keys()].map(
        i => notFoundIndex++ + 1
      )
    );
  }

  if (oArray.length && pArray.length) {
    console.log("==Original Array==", oArray);
    console.log("==Paraphraase Array==", pArray);
    return manhattanDistance(oArray, pArray);
  }

  return null;
};
