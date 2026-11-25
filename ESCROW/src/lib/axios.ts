// import axios from "axios";
//
// const api = axios.create({
//   baseURL: "/api",
// });
//
// // 🔥 auto inject DID
// api.interceptors.request.use((config) => {
//   if (typeof window !== "undefined") {
//     const did = localStorage.getItem("did");
//     if (did) {
//       config.headers["x-user-did"] = did;
//     }
//   }
//   return config;
// });
//
// export default api;