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
import type * as ai_actions from "../ai/actions.js";
import type * as ai_client from "../ai/client.js";
import type * as ai_crypto from "../ai/crypto.js";
import type * as ai_draftActions from "../ai/draftActions.js";
import type * as ai_followupActions from "../ai/followupActions.js";
import type * as ai_profileActions from "../ai/profileActions.js";
import type * as ai_prompts from "../ai/prompts.js";
import type * as ai_providers from "../ai/providers.js";
import type * as ai_resolve from "../ai/resolve.js";
import type * as ai_tailor from "../ai/tailor.js";
import type * as ai_verify from "../ai/verify.js";
import type * as aiSettings from "../aiSettings.js";
import type * as apiKeys from "../apiKeys.js";
import type * as applications from "../applications.js";
import type * as auth from "../auth.js";
import type * as careerProfile from "../careerProfile.js";
import type * as crons from "../crons.js";
import type * as discovery_actions from "../discovery/actions.js";
import type * as discovery_fetchers from "../discovery/fetchers.js";
import type * as discovery_jobs from "../discovery/jobs.js";
import type * as discovery_kinds from "../discovery/kinds.js";
import type * as discovery_prefilter from "../discovery/prefilter.js";
import type * as discovery_sources from "../discovery/sources.js";
import type * as draftSupport from "../draftSupport.js";
import type * as drafts from "../drafts.js";
import type * as entitlements from "../entitlements.js";
import type * as http from "../http.js";
import type * as jobs from "../jobs.js";
import type * as lib_caps from "../lib/caps.js";
import type * as lib_html from "../lib/html.js";
import type * as lib_jobUrls from "../lib/jobUrls.js";
import type * as lib_profileIds from "../lib/profileIds.js";
import type * as lib_status from "../lib/status.js";
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
  "ai/actions": typeof ai_actions;
  "ai/client": typeof ai_client;
  "ai/crypto": typeof ai_crypto;
  "ai/draftActions": typeof ai_draftActions;
  "ai/followupActions": typeof ai_followupActions;
  "ai/profileActions": typeof ai_profileActions;
  "ai/prompts": typeof ai_prompts;
  "ai/providers": typeof ai_providers;
  "ai/resolve": typeof ai_resolve;
  "ai/tailor": typeof ai_tailor;
  "ai/verify": typeof ai_verify;
  aiSettings: typeof aiSettings;
  apiKeys: typeof apiKeys;
  applications: typeof applications;
  auth: typeof auth;
  careerProfile: typeof careerProfile;
  crons: typeof crons;
  "discovery/actions": typeof discovery_actions;
  "discovery/fetchers": typeof discovery_fetchers;
  "discovery/jobs": typeof discovery_jobs;
  "discovery/kinds": typeof discovery_kinds;
  "discovery/prefilter": typeof discovery_prefilter;
  "discovery/sources": typeof discovery_sources;
  draftSupport: typeof draftSupport;
  drafts: typeof drafts;
  entitlements: typeof entitlements;
  http: typeof http;
  jobs: typeof jobs;
  "lib/caps": typeof lib_caps;
  "lib/html": typeof lib_html;
  "lib/jobUrls": typeof lib_jobUrls;
  "lib/profileIds": typeof lib_profileIds;
  "lib/status": typeof lib_status;
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
