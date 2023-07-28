import { NextResponse } from "next/server";

const whoiser = require("whoiser");

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const domainName = searchParams.get("domainName");
  const tlds = [".com", ".org", ".io", ".net", ".xyz"];
  const domains = await Promise.all(
    tlds.map((tld) => isDomainAvailable(domainName + tld)),
  );
  return NextResponse.json({ domains: domains });
}

async function isDomainAvailable(domainName) {
  const domainWhois = await whoiser(domainName, { follow: 1 });
  const firstDomainWhois = whoiser.firstResult(domainWhois);
  const firstTextLine = (firstDomainWhois.text[0] || "").toLowerCase();
  let domainAvailability = "unknown";
  if (firstTextLine.includes("reserved")) {
    domainAvailability = "reserved";
  } else if (
    firstDomainWhois["Domain Name"] &&
    firstDomainWhois["Domain Name"].toLowerCase() === domainName
  ) {
    domainAvailability = "registered";
  } else if (firstTextLine.includes(`no match for "${domainName}"`)) {
    domainAvailability = "available";
  }
  return { domain: domainName, available: domainAvailability === "available" };
}
