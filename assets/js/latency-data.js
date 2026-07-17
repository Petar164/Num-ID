/* ============================================================
   num-iD — per-country response times for the coverage globe.

   These are PLACEHOLDER values. Until real measurements are
   provided, any country not listed here gets a stable,
   plausible simulated number (see latencyFor in main.js).

   To supply real data, add entries keyed by the country name
   exactly as it appears on the globe (world-atlas names), e.g.:

     window.NUMID_LATENCY = {
       "Spain":         { mnp: 132, hlr: 410 },
       "Germany":       { mnp: 118, hlr: 385 },
       "United States": { mnp: 154, hlr: 470 }
     };

   Values are milliseconds. Countries listed here show real
   numbers; everything else stays simulated.
   ============================================================ */

window.NUMID_LATENCY = {};
