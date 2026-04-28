/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ResendOTP from "../ResendOTP.js";
import type * as applications from "../applications.js";
import type * as auth from "../auth.js";
import type * as draftSupport from "../draftSupport.js";
import type * as drafts from "../drafts.js";
import type * as entitlements from "../entitlements.js";
import type * as http from "../http.js";
import type * as jobs from "../jobs.js";
import type * as lib_jobUrls from "../lib/jobUrls.js";
import type * as profiles from "../profiles.js";
import type * as purchases from "../purchases.js";
import type * as validators from "../validators.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ResendOTP: typeof ResendOTP;
  applications: typeof applications;
  auth: typeof auth;
  draftSupport: typeof draftSupport;
  drafts: typeof drafts;
  entitlements: typeof entitlements;
  http: typeof http;
  jobs: typeof jobs;
  "lib/jobUrls": typeof lib_jobUrls;
  profiles: typeof profiles;
  purchases: typeof purchases;
  validators: typeof validators;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
