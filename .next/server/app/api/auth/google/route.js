/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/auth/google/route";
exports.ids = ["app/api/auth/google/route"];
exports.modules = {

/***/ "(rsc)/./app/api/auth/google/route.ts":
/*!**************************************!*\
  !*** ./app/api/auth/google/route.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n\nasync function GET(request) {\n    const clientId = process.env.GOOGLE_CLIENT_ID;\n    if (!clientId) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Google OAuth is not configured\"\n        }, {\n            status: 500\n        });\n    }\n    // Get the base URL (e.g. http://localhost:3000)\n    const origin = new URL(request.url).origin;\n    const redirectUri = `${origin}/api/auth/google/callback`;\n    const authUrl = new URL(\"https://accounts.google.com/o/oauth2/v2/auth\");\n    authUrl.searchParams.set(\"client_id\", clientId);\n    authUrl.searchParams.set(\"redirect_uri\", redirectUri);\n    authUrl.searchParams.set(\"response_type\", \"code\");\n    authUrl.searchParams.set(\"scope\", \"openid email profile\");\n    authUrl.searchParams.set(\"access_type\", \"online\");\n    authUrl.searchParams.set(\"prompt\", \"select_account\");\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.redirect(authUrl.toString());\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2F1dGgvZ29vZ2xlL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQTJDO0FBRXBDLGVBQWVDLElBQUlDLE9BQWdCO0lBQ3hDLE1BQU1DLFdBQVdDLFFBQVFDLEdBQUcsQ0FBQ0MsZ0JBQWdCO0lBRTdDLElBQUksQ0FBQ0gsVUFBVTtRQUNiLE9BQU9ILHFEQUFZQSxDQUFDTyxJQUFJLENBQUM7WUFBRUMsT0FBTztRQUFpQyxHQUFHO1lBQUVDLFFBQVE7UUFBSTtJQUN0RjtJQUVBLGdEQUFnRDtJQUNoRCxNQUFNQyxTQUFTLElBQUlDLElBQUlULFFBQVFVLEdBQUcsRUFBRUYsTUFBTTtJQUMxQyxNQUFNRyxjQUFjLEdBQUdILE9BQU8seUJBQXlCLENBQUM7SUFFeEQsTUFBTUksVUFBVSxJQUFJSCxJQUFJO0lBQ3hCRyxRQUFRQyxZQUFZLENBQUNDLEdBQUcsQ0FBQyxhQUFhYjtJQUN0Q1csUUFBUUMsWUFBWSxDQUFDQyxHQUFHLENBQUMsZ0JBQWdCSDtJQUN6Q0MsUUFBUUMsWUFBWSxDQUFDQyxHQUFHLENBQUMsaUJBQWlCO0lBQzFDRixRQUFRQyxZQUFZLENBQUNDLEdBQUcsQ0FBQyxTQUFTO0lBQ2xDRixRQUFRQyxZQUFZLENBQUNDLEdBQUcsQ0FBQyxlQUFlO0lBQ3hDRixRQUFRQyxZQUFZLENBQUNDLEdBQUcsQ0FBQyxVQUFVO0lBRW5DLE9BQU9oQixxREFBWUEsQ0FBQ2lCLFFBQVEsQ0FBQ0gsUUFBUUksUUFBUTtBQUMvQyIsInNvdXJjZXMiOlsiL1VzZXJzL3lhdGhhYXJ0aHNoYXJtYS9EZXNrdG9wL3Rlc3N0ZXIvYXBwL2FwaS9hdXRoL2dvb2dsZS9yb3V0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0UmVzcG9uc2UgfSBmcm9tIFwibmV4dC9zZXJ2ZXJcIjtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIEdFVChyZXF1ZXN0OiBSZXF1ZXN0KSB7XG4gIGNvbnN0IGNsaWVudElkID0gcHJvY2Vzcy5lbnYuR09PR0xFX0NMSUVOVF9JRDtcbiAgXG4gIGlmICghY2xpZW50SWQpIHtcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogXCJHb29nbGUgT0F1dGggaXMgbm90IGNvbmZpZ3VyZWRcIiB9LCB7IHN0YXR1czogNTAwIH0pO1xuICB9XG5cbiAgLy8gR2V0IHRoZSBiYXNlIFVSTCAoZS5nLiBodHRwOi8vbG9jYWxob3N0OjMwMDApXG4gIGNvbnN0IG9yaWdpbiA9IG5ldyBVUkwocmVxdWVzdC51cmwpLm9yaWdpbjtcbiAgY29uc3QgcmVkaXJlY3RVcmkgPSBgJHtvcmlnaW59L2FwaS9hdXRoL2dvb2dsZS9jYWxsYmFja2A7XG5cbiAgY29uc3QgYXV0aFVybCA9IG5ldyBVUkwoXCJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20vby9vYXV0aDIvdjIvYXV0aFwiKTtcbiAgYXV0aFVybC5zZWFyY2hQYXJhbXMuc2V0KFwiY2xpZW50X2lkXCIsIGNsaWVudElkKTtcbiAgYXV0aFVybC5zZWFyY2hQYXJhbXMuc2V0KFwicmVkaXJlY3RfdXJpXCIsIHJlZGlyZWN0VXJpKTtcbiAgYXV0aFVybC5zZWFyY2hQYXJhbXMuc2V0KFwicmVzcG9uc2VfdHlwZVwiLCBcImNvZGVcIik7XG4gIGF1dGhVcmwuc2VhcmNoUGFyYW1zLnNldChcInNjb3BlXCIsIFwib3BlbmlkIGVtYWlsIHByb2ZpbGVcIik7XG4gIGF1dGhVcmwuc2VhcmNoUGFyYW1zLnNldChcImFjY2Vzc190eXBlXCIsIFwib25saW5lXCIpO1xuICBhdXRoVXJsLnNlYXJjaFBhcmFtcy5zZXQoXCJwcm9tcHRcIiwgXCJzZWxlY3RfYWNjb3VudFwiKTtcblxuICByZXR1cm4gTmV4dFJlc3BvbnNlLnJlZGlyZWN0KGF1dGhVcmwudG9TdHJpbmcoKSk7XG59XG4iXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwiR0VUIiwicmVxdWVzdCIsImNsaWVudElkIiwicHJvY2VzcyIsImVudiIsIkdPT0dMRV9DTElFTlRfSUQiLCJqc29uIiwiZXJyb3IiLCJzdGF0dXMiLCJvcmlnaW4iLCJVUkwiLCJ1cmwiLCJyZWRpcmVjdFVyaSIsImF1dGhVcmwiLCJzZWFyY2hQYXJhbXMiLCJzZXQiLCJyZWRpcmVjdCIsInRvU3RyaW5nIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/auth/google/route.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fauth%2Fgoogle%2Froute&page=%2Fapi%2Fauth%2Fgoogle%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fgoogle%2Froute.ts&appDir=%2FUsers%2Fyathaarthsharma%2FDesktop%2Ftesster%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fyathaarthsharma%2FDesktop%2Ftesster&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fauth%2Fgoogle%2Froute&page=%2Fapi%2Fauth%2Fgoogle%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fgoogle%2Froute.ts&appDir=%2FUsers%2Fyathaarthsharma%2FDesktop%2Ftesster%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fyathaarthsharma%2FDesktop%2Ftesster&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_yathaarthsharma_Desktop_tesster_app_api_auth_google_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/auth/google/route.ts */ \"(rsc)/./app/api/auth/google/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/auth/google/route\",\n        pathname: \"/api/auth/google\",\n        filename: \"route\",\n        bundlePath: \"app/api/auth/google/route\"\n    },\n    resolvedPagePath: \"/Users/yathaarthsharma/Desktop/tesster/app/api/auth/google/route.ts\",\n    nextConfigOutput,\n    userland: _Users_yathaarthsharma_Desktop_tesster_app_api_auth_google_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZhdXRoJTJGZ29vZ2xlJTJGcm91dGUmcGFnZT0lMkZhcGklMkZhdXRoJTJGZ29vZ2xlJTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGYXV0aCUyRmdvb2dsZSUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRnlhdGhhYXJ0aHNoYXJtYSUyRkRlc2t0b3AlMkZ0ZXNzdGVyJTJGYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj0lMkZVc2VycyUyRnlhdGhhYXJ0aHNoYXJtYSUyRkRlc2t0b3AlMkZ0ZXNzdGVyJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUErRjtBQUN2QztBQUNxQjtBQUNtQjtBQUNoRztBQUNBO0FBQ0E7QUFDQSx3QkFBd0IseUdBQW1CO0FBQzNDO0FBQ0EsY0FBYyxrRUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHNEQUFzRDtBQUM5RDtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUMwRjs7QUFFMUYiLCJzb3VyY2VzIjpbIiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiL1VzZXJzL3lhdGhhYXJ0aHNoYXJtYS9EZXNrdG9wL3Rlc3N0ZXIvYXBwL2FwaS9hdXRoL2dvb2dsZS9yb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvYXV0aC9nb29nbGUvcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9hdXRoL2dvb2dsZVwiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvYXV0aC9nb29nbGUvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCIvVXNlcnMveWF0aGFhcnRoc2hhcm1hL0Rlc2t0b3AvdGVzc3Rlci9hcHAvYXBpL2F1dGgvZ29vZ2xlL3JvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgd29ya0FzeW5jU3RvcmFnZSxcbiAgICAgICAgd29ya1VuaXRBc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fauth%2Fgoogle%2Froute&page=%2Fapi%2Fauth%2Fgoogle%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fgoogle%2Froute.ts&appDir=%2FUsers%2Fyathaarthsharma%2FDesktop%2Ftesster%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fyathaarthsharma%2FDesktop%2Ftesster&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fauth%2Fgoogle%2Froute&page=%2Fapi%2Fauth%2Fgoogle%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fgoogle%2Froute.ts&appDir=%2FUsers%2Fyathaarthsharma%2FDesktop%2Ftesster%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fyathaarthsharma%2FDesktop%2Ftesster&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();