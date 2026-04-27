"use client";

import { useEffect } from "react";
import { initDataFast } from "datafast";

const DATAFAST_WEBSITE_ID = "dfid_49LZW4H1LKiCeK8IfP5fp";

export default function DataFastAnalytics() {
  useEffect(() => {
    void initDataFast({
      websiteId: DATAFAST_WEBSITE_ID,
      cookieless: true,
    });
  }, []);

  return null;
}
