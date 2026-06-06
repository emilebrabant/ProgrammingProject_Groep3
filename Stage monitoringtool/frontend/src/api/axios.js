//endpoint maken in frontend voor backend communicatie
import axios from "axios";

export default axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true, // nodig voor sessies!
});