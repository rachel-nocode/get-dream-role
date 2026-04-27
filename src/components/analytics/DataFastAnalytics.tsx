"use client";

import { useEffect } from "react";
import { initDataFast } from "datafast";

const DATAFAST_WEBSITE_ID = "dfid_49LZW4H1LKiCeK8IfP5fp";
const DATAFAST_DOMAIN = "getdreamrole.com";

export default function DataFastAnalytics() {
  useEffect(() => {
    void initDataFast({
      websiteId: DATAFAST_WEBSITE_ID,
      domain: DATAFAST_DOMAIN,
      autoCapturePageviews: true,
      cookieless: true,
    });
  }, []);

  return null;
}
