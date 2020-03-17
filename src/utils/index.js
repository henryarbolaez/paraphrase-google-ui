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
