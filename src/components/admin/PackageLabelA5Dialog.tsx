import { useState, useEffect, useRef, useCallback } from "react";
import { AdminDialog } from "./AdminDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Printer, Package, AlertTriangle, Phone, MapPin, Building2,
  Truck, DollarSign, User, Hash, RefreshCw, Copy, Check, Info, Loader2, ExternalLink
} from "lucide-react";
import { adminUsersApi, type AdminOrder } from "@/lib/api";
import { getInvoiceBranding } from "@/lib/invoice-branding";
import { getReceivedNotesForOrder } from "@/lib/receivedNotesStorage";

export interface PackageLabelPrintData {
  warningText: string;
  senderPhone: string;
  receiverPhone: string;
  city: string;
  branch: string;
  customerName?: string;
  orderId?: string;
  courier?: string;
  codAmount?: string;
  itemsSummary?: string;
  showCustomerName?: boolean;
  showOrderId?: boolean;
  showCod?: boolean;
  showItems?: boolean;
  singleLineLocation?: boolean;
  logoUrl?: string;
  siteName?: string;
  paperSize?: "a5" | "a4" | "thermal_100x150" | "thermal_76x130";
}

export interface CambodiaProvinceDef {
  nameEn: string;
  nameKh: string;
  aliases: string[];
}

export const CAMBODIA_PROVINCES: CambodiaProvinceDef[] = [
  { nameEn: "Phnom Penh", nameKh: "ភ្នំពេញ", aliases: ["phnom penh", "phnompenh", "ភ្នំពេញ", "pp"] },
  { nameEn: "Sihanoukville", nameKh: "ព្រះសីហនុ", aliases: ["sihanoukville", "preah sihanouk", "kampong som", "ព្រះសីហនុ", "កំពង់សោម", "shv", "sihanouk"] },
  { nameEn: "Siem Reap", nameKh: "សៀមរាប", aliases: ["siem reap", "siemreap", "សៀមរាប", "sr"] },
  { nameEn: "Battambang", nameKh: "បាត់ដំបង", aliases: ["battambang", "បាត់ដំបង", "btb"] },
  { nameEn: "Kampot", nameKh: "កំពត", aliases: ["kampot", "កំពត"] },
  { nameEn: "Poipet", nameKh: "ប៉ោយប៉ែត", aliases: ["poipet", "ប៉ោយប៉ែត"] },
  { nameEn: "Banteay Meanchey", nameKh: "បន្ទាយមានជ័យ", aliases: ["banteay meanchey", "banteaymeanchey", "បន្ទាយមានជ័យ", "sisophon", "bmc"] },
  { nameEn: "Kampong Cham", nameKh: "កំពង់ចាម", aliases: ["kampong cham", "kampongcham", "កំពង់ចាម"] },
  { nameEn: "Kandal", nameKh: "កណ្តាល", aliases: ["kandal", "កណ្តាល", "ta khmau", "takhmao", "តាខ្មៅ"] },
  { nameEn: "Kampong Speu", nameKh: "កំពង់ស្ពឺ", aliases: ["kampong speu", "kampongspeu", "កំពង់ស្ពឺ"] },
  { nameEn: "Takeo", nameKh: "តាកែវ", aliases: ["takeo", "តាកែវ"] },
  { nameEn: "Koh Kong", nameKh: "កោះកុង", aliases: ["koh kong", "kohkong", "កោះកុង"] },
  { nameEn: "Kampong Chhnang", nameKh: "កំពង់ឆ្នាំង", aliases: ["kampong chhnang", "kampongchhnang", "កំពង់ឆ្នាំង"] },
  { nameEn: "Pursat", nameKh: "ពោធិ៍សាត់", aliases: ["pursat", "ពោធិ៍សាត់"] },
  { nameEn: "Prey Veng", nameKh: "ព្រៃវែង", aliases: ["prey veng", "preyveng", "ព្រៃវែង"] },
  { nameEn: "Svay Rieng", nameKh: "ស្វាយរៀង", aliases: ["svay rieng", "svayrieng", "ស្វាយរៀង", "bavet", "បាវិត"] },
  { nameEn: "Kratie", nameKh: "ក្រចេះ", aliases: ["kratie", "ក្រចេះ"] },
  { nameEn: "Stung Treng", nameKh: "ស្ទឹងត្រែង", aliases: ["stung treng", "stungtreng", "ស្ទឹងត្រែង"] },
  { nameEn: "Ratanakiri", nameKh: "រតនគិរី", aliases: ["ratanakiri", "រតនគិរី", "banlung", "បានលុង"] },
  { nameEn: "Mondulkiri", nameKh: "មណ្ឌលគិរី", aliases: ["mondulkiri", "មណ្ឌលគិរី", "sen monorom", "សែនមនោរម្យ"] },
  { nameEn: "Preah Vihear", nameKh: "ព្រះវិហារ", aliases: ["preah vihear", "preahvihear", "ព្រះវិហារ"] },
  { nameEn: "Oddar Meanchey", nameKh: "ឧត្តរមានជ័យ", aliases: ["oddar meanchey", "oddarmeanchey", "ឧត្តរមានជ័យ", "samraong", "សំរោង"] },
  { nameEn: "Pailin", nameKh: "ប៉ៃលិន", aliases: ["pailin", "ប៉ៃលិន"] },
  { nameEn: "Kep", nameKh: "កែប", aliases: ["kep", "កែប"] },
  { nameEn: "Tboung Khmum", nameKh: "ត្បូងឃ្មុំ", aliases: ["tboung khmum", "tboungkhmum", "ត្បូងឃ្មុំ", "suong", "សួង"] },
];

export const POPULAR_PROVINCES = [
  "Phnom Penh",
  "Sihanoukville",
  "Siem Reap",
  "Battambang",
  "Kampot",
  "Poipet",
  "Kampong Cham",
  "Kandal",
];

export const COURIER_PRESETS = [
  "None",
  "Virak Buntham (VET)",
  "J&T Express",
  "Capitol Transport",
  "Kerry Express",
  "Flash Express",
  "ZTO Express",
  "Speed Cargo",
];

export const WARNING_PRESETS = [
  "ប្រយ័ត្នបាក់បែក ឬ សើម",
  "ប្រយ័ត្នបាក់បែក (FRAGILE)",
  "ហាមជាន់ ឬ បោះ (DO NOT DROP)",
  "កុំផ្កាប់ ឬ ផ្អៀង (THIS WAY UP)",
];

/**
 * Extract phone number from unstructured text or notes
 */
export function extractPhoneFromText(text?: string | null): string | null {
  if (!text) return null;
  const patterns = [
    /(?:\+?855|0)[1-9]\d{1,2}[\s.-]?\d{2,3}[\s.-]?\d{3,4}\b/,
    /\b0\d{8,9}\b/,
    /\b0\d{2}[\s.-]\d{3}[\s.-]\d{3,4}\b/,
  ];
  for (const regex of patterns) {
    const match = text.match(regex);
    if (match) {
      return match[0].trim();
    }
  }
  return null;
}

/**
 * Dynamically resolve customer phone from multiple possible order fields
 */
export function resolveCustomerPhone(order?: AdminOrder | null, detailedOrder?: AdminOrder | null): string {
  if (!order && !detailedOrder) return "";
  const o = detailedOrder || order;
  const rawList = [
    detailedOrder?.customer?.phone,
    detailedOrder?.user?.phone,
    order?.customer?.phone,
    order?.user?.phone,
    (detailedOrder as any)?.customer_phone,
    (order as any)?.customer_phone,
    (detailedOrder as any)?.shipping_phone,
    (order as any)?.shipping_phone,
    (detailedOrder as any)?.receiver_phone,
    (order as any)?.receiver_phone,
    (detailedOrder as any)?.phone,
    (order as any)?.phone,
  ];

  for (const p of rawList) {
    if (p && typeof p === "string" && p.trim() && p.trim() !== "—" && p.trim() !== "null" && p.trim() !== "undefined") {
      return p.trim();
    }
  }

  // Check stored customer received notes for this order
  if (o?.id) {
    try {
      const pastNotes = getReceivedNotesForOrder(o.id);
      if (pastNotes.length > 0 && pastNotes[0].receiver_phone?.trim()) {
        return pastNotes[0].receiver_phone.trim();
      }
    } catch {
      // ignore
    }
  }

  // Check order notes for written phone numbers
  const notePhone = extractPhoneFromText(detailedOrder?.notes || order?.notes);
  if (notePhone) return notePhone;

  return "";
}

/**
 * Dynamically resolve customer raw address from multiple possible order fields
 */
export function resolveCustomerAddress(order?: AdminOrder | null, detailedOrder?: AdminOrder | null): string {
  if (!order && !detailedOrder) return "";
  const o = detailedOrder || order;
  const rawList = [
    detailedOrder?.customer?.address,
    detailedOrder?.user?.address,
    order?.customer?.address,
    order?.user?.address,
    (detailedOrder as any)?.customer_address,
    (order as any)?.customer_address,
    (detailedOrder as any)?.shipping_address,
    (order as any)?.shipping_address,
    (detailedOrder as any)?.delivery_address,
    (order as any)?.delivery_address,
    (detailedOrder as any)?.address,
    (order as any)?.address,
    (detailedOrder as any)?.receiver_address,
    (order as any)?.receiver_address,
    (detailedOrder as any)?.location,
    (order as any)?.location,
  ];

  for (const a of rawList) {
    if (a && typeof a === "string" && a.trim() && a.trim() !== "—" && a.trim() !== "null" && a.trim() !== "undefined") {
      const trimmed = a.trim();
      if (trimmed.toLowerCase() !== "cambodia") {
        return trimmed;
      }
    }
  }

  // Check stored customer received notes for this order
  if (o?.id) {
    try {
      const pastNotes = getReceivedNotesForOrder(o.id);
      if (pastNotes.length > 0 && pastNotes[0].receiver_address?.trim()) {
        return pastNotes[0].receiver_address.trim();
      }
    } catch {
      // ignore
    }
  }

  // Look inside order notes for an address line
  const notesText = detailedOrder?.notes || order?.notes;
  if (notesText) {
    const addrLineMatch = notesText.match(/(?:Address|Location|To|Ship to|Del|Delivery|ទីតាំង)[:\-]\s*([^\n,]+(?:,[^\n,]+)*)/i);
    if (addrLineMatch && addrLineMatch[1]) {
      return addrLineMatch[1].trim();
    }
  }

  return "";
}

/**
 * Parse Cambodia address into City/Province and Branch/Depot/Street
 */
export function parseCustomerLocation(rawAddress: string, notes?: string): {
  city: string;
  branch: string;
  detectedCourier?: string;
} {
  const combinedText = `${rawAddress || ""} ${notes || ""}`.trim();

  // 1. Detect courier
  let detectedCourier: string | undefined;
  const lowerCombined = combinedText.toLowerCase();
  if (lowerCombined.includes("virak buntham") || lowerCombined.includes("vet") || lowerCombined.includes("វីរៈប៊ុនថាំ") || lowerCombined.includes("វីរៈ ប៊ុនថាំ")) {
    detectedCourier = "Virak Buntham (VET)";
  } else if (lowerCombined.includes("j&t") || lowerCombined.includes("j and t") || lowerCombined.includes("jnt")) {
    detectedCourier = "J&T Express";
  } else if (lowerCombined.includes("capitol") || lowerCombined.includes("កាពីតូល")) {
    detectedCourier = "Capitol Transport";
  } else if (lowerCombined.includes("kerry")) {
    detectedCourier = "Kerry Express";
  } else if (lowerCombined.includes("flash")) {
    detectedCourier = "Flash Express";
  } else if (lowerCombined.includes("zto")) {
    detectedCourier = "ZTO Express";
  } else if (lowerCombined.includes("speed")) {
    detectedCourier = "Speed Cargo";
  }

  // Clean raw address
  let cleanAddress = (rawAddress || "").replace(/,\s*Cambodia\b/gi, "").replace(/\bCambodia\b/gi, "").trim();
  cleanAddress = cleanAddress.replace(/^[,\s/–-]+|[,\s/–-]+$/g, "");

  // If clean address is empty, try notes
  if (!cleanAddress && notes) {
    const addrLineMatch = notes.match(/(?:Address|Location|To|Ship to|Del|Delivery|ទីតាំង)[:\-]\s*([^\n,]+(?:,[^\n,]+)*)/i);
    if (addrLineMatch && addrLineMatch[1]) {
      cleanAddress = addrLineMatch[1].trim();
    }
  }

  let detectedCity = "";
  let detectedBranch = cleanAddress;

  if (cleanAddress) {
    // Check against all provinces and aliases
    for (const prov of CAMBODIA_PROVINCES) {
      for (const alias of prov.aliases) {
        const isKhmer = /[\u1780-\u17FF]/.test(alias);
        const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const pattern = isKhmer ? new RegExp(escaped, "i") : new RegExp(`\\b${escaped}\\b`, "i");

        if (pattern.test(cleanAddress)) {
          detectedCity = prov.nameEn;
          // Strip province name/alias from branch text
          detectedBranch = cleanAddress
            .replace(pattern, "")
            .replace(new RegExp(prov.nameEn, "gi"), "")
            .replace(new RegExp(prov.nameKh, "gi"), "")
            .replace(/^[,\s/–-]+|[,\s/–-]+$/g, "")
            .trim();
          break;
        }
      }
      if (detectedCity) break;
    }

    // If still no province found, check if Phnom Penh districts are mentioned
    if (!detectedCity) {
      const ppDistricts = [
        "toul kork", "sen sok", "chamkarmon", "bkk", "bkk1", "bkk2", "bkk3", "boeng keng kang",
        "chroy changvar", "meanchey", "dangkao", "russey keo", "prampir makara", "daun penh",
        "por senchey", "prek pnov", "chbar ampov", "boeung trabek", "toul tom poung",
        "ទួលគោក", "សែនសុខ", "ចំការមន", "បឹងកេងកង", "ជ្រោយចង្វារ", "មានជ័យ", "ដង្កោ", "ឫស្សីកែវ",
        "៧មករា", "ដូនពេញ", "ពោធិ៍សែនជ័យ", "ច្បារអំពៅ"
      ];
      for (const d of ppDistricts) {
        if (cleanAddress.toLowerCase().includes(d.toLowerCase())) {
          detectedCity = "Phnom Penh";
          detectedBranch = cleanAddress;
          break;
        }
      }
    }
  }

  if (detectedCity) {
    return {
      city: detectedCity,
      branch: detectedBranch || "",
      detectedCourier,
    };
  }

  if (cleanAddress) {
    return {
      city: "Phnom Penh",
      branch: cleanAddress,
      detectedCourier,
    };
  }

  return {
    city: "Phnom Penh",
    branch: "",
    detectedCourier,
  };
}

/**
 * Clean SVG Warning Triangle exactly matching the user's sample
 */
export const WarningTriangleSvg = ({ className = "w-32 h-28" }: { className?: string }) => (
  <svg viewBox="0 0 100 88" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Yellow background triangle with rounded corners & black border */}
    <path
      d="M 50 7 L 92 78 C 94 82 91 86 86 86 L 14 86 C 9 86 6 82 8 78 L 50 7 Z"
      fill="#FFD200"
      stroke="#000000"
      strokeWidth="7"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
    {/* Black exclamation mark bar */}
    <path
      d="M 50 28 L 50 56"
      stroke="#000000"
      strokeWidth="7.5"
      strokeLinecap="round"
    />
    {/* Black exclamation mark dot */}
    <circle cx="50" cy="71" r="4.2" fill="#000000" />
  </svg>
);

/**
 * Universal print helper for A5 package label
 */
export function printA5PackageLabel(data: PackageLabelPrintData, mode: "auto" | "window" = "auto"): void {
  const html = `<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <title>A5 Package Label - ${data.receiverPhone || data.city || "Package"}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;500;600;700;800&family=Inter:wght@400;600;700;800;900&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    @page {
      size: ${
        data.paperSize === 'a4'
          ? 'A4 portrait'
          : data.paperSize === 'thermal_100x150'
          ? '100mm 150mm'
          : data.paperSize === 'thermal_76x130'
          ? '76mm 130mm'
          : 'A5 portrait'
      };
      margin: ${data.paperSize === 'a4' ? '6mm 8mm' : '4mm 5mm'};
    }

    html, body {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #000000;
      font-family: 'Kantumruy Pro', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      overflow: hidden;
    }

    .label-page {
      width: 100%;
      height: 100%;
      max-height: ${data.paperSize === 'a4' ? '280mm' : data.paperSize === 'thermal_100x150' ? '142mm' : data.paperSize === 'thermal_76x130' ? '122mm' : '200mm'};
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      text-align: center;
      padding: ${data.paperSize === 'a4' ? '6mm 5mm' : '3mm 2mm'};
      box-sizing: border-box;
      page-break-inside: avoid;
      break-inside: avoid;
      overflow: hidden;
    }

    .top-section {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .courier-badge {
      display: inline-block;
      border: 3px solid #000000;
      padding: 3px 18px;
      border-radius: 8px;
      font-weight: 900;
      font-size: ${data.paperSize === 'a4' ? '22px' : '17px'};
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 2mm;
    }

    .brand-header-top {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 2mm;
    }

    .brand-top-logo {
      width: ${data.paperSize === 'a4' ? '44px' : '36px'};
      height: ${data.paperSize === 'a4' ? '44px' : '36px'};
      object-fit: contain;
    }

    .brand-top-title {
      font-size: ${data.paperSize === 'a4' ? '20px' : '16px'};
      font-weight: 900;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #000000;
    }

    .symbols-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
      margin: 1mm 0 2mm 0;
      flex-shrink: 0;
    }

    .triangle-container {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .triangle-container svg {
      width: ${data.paperSize === 'a4' ? '140px' : data.paperSize === 'thermal_100x150' ? '95px' : '115px'};
      height: ${data.paperSize === 'a4' ? '122px' : data.paperSize === 'thermal_100x150' ? '82px' : '100px'};
    }

    .fragile-container {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .fragile-symbol {
      width: ${data.paperSize === 'a4' ? '80px' : data.paperSize === 'thermal_100x150' ? '54px' : '65px'};
      height: ${data.paperSize === 'a4' ? '80px' : data.paperSize === 'thermal_100x150' ? '54px' : '65px'};
    }

    .warning-text {
      font-size: ${data.paperSize === 'a4' ? '32px' : data.paperSize === 'thermal_100x150' ? '22px' : '28px'};
      font-weight: 900;
      line-height: 1.25;
      color: #000000;
      margin-bottom: 2mm;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }

    .sender-text {
      font-size: ${data.paperSize === 'a4' ? '28px' : data.paperSize === 'thermal_100x150' ? '19px' : '23px'};
      font-weight: 800;
      line-height: 1.3;
      color: #111827;
      margin-bottom: 2mm;
      white-space: nowrap;
    }

    .middle-section {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1.5mm 0;
    }

    .receiver-phone {
      font-size: ${data.paperSize === 'a4' ? '56px' : data.paperSize === 'thermal_100x150' ? '38px' : '46px'};
      font-weight: 900;
      line-height: 1.15;
      letter-spacing: 2px;
      color: #000000;
      font-family: 'Inter', monospace, sans-serif;
      margin: 1.5mm 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }

    .destination-text {
      font-size: ${data.paperSize === 'a4' ? '38px' : data.paperSize === 'thermal_100x150' ? '26px' : '32px'};
      font-weight: 900;
      line-height: 1.3;
      color: #000000;
      margin: 1.5mm 0;
      max-width: 100%;
      text-align: center;
      padding: 0 2mm;
    }

    .city-part {
      font-weight: 800;
      color: #111827;
    }

    .loc-sep {
      color: #4b5563;
      font-weight: 700;
      margin: 0 6px;
    }

    .branch-part {
      font-weight: 900;
      color: #000000;
    }

    .city-text {
      font-size: ${data.paperSize === 'a4' ? '34px' : '28px'};
      font-weight: 800;
      line-height: 1.25;
      color: #000000;
      margin-bottom: 1.5mm;
    }

    .branch-text {
      font-size: ${data.paperSize === 'a4' ? '38px' : '32px'};
      font-weight: 900;
      line-height: 1.3;
      color: #000000;
      max-width: 100%;
      margin-bottom: 2mm;
      padding: 0 3mm;
    }

    .cod-badge {
      display: inline-block;
      background: #000000;
      color: #ffffff;
      padding: 5px 22px;
      border-radius: 8px;
      font-size: ${data.paperSize === 'a4' ? '28px' : '22px'};
      font-weight: 900;
      letter-spacing: 0.5px;
      margin: 2mm 0;
    }

    .extra-section {
      width: 100%;
      margin-top: 2mm;
      padding-top: 2mm;
      border-top: 1.5px dashed #000000;
      display: flex;
      flex-direction: column;
      gap: 1.5mm;
      text-align: left;
      font-size: 13px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .extra-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #111827;
    }

    @media print {
      html, body {
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      .label-page {
        height: 100%;
        max-height: 200mm;
        page-break-inside: avoid;
        page-break-after: avoid;
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="label-page">
    <div class="top-section">
      ${data.logoUrl || data.siteName ? `
        <div class="brand-header-top">
          <img src="${data.logoUrl || '/realtech-logo.png'}" alt="Logo" class="brand-top-logo" onerror="this.style.display='none'" />
          <span class="brand-top-title">${data.siteName || 'REALTECH'}</span>
        </div>
      ` : ""}

      ${data.courier && data.courier !== "None" ? `
        <div>
          <span class="courier-badge">${data.courier}</span>
        </div>
      ` : ""}

      <div class="symbols-container">
        <div class="triangle-container">
          <svg viewBox="0 0 100 88" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M 50 7 L 92 78 C 94 82 91 86 86 86 L 14 86 C 9 86 6 82 8 78 L 50 7 Z"
              fill="#FFD200"
              stroke="#000000"
              stroke-width="7"
              stroke-linejoin="round"
              stroke-linecap="round"
            />
            <path
              d="M 50 28 L 50 56"
              stroke="#000000"
              stroke-width="7.5"
              stroke-linecap="round"
            />
            <circle cx="50" cy="71" r="4.2" fill="#000000" />
          </svg>
        </div>
        <div class="fragile-container">
          <svg viewBox="0 0 24 24" class="fragile-symbol" fill="none" stroke="#000000" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v20M8 22h8M19 3v4c0 3.31-2.69 6-6 6h-2c-3.31 0-6-2.69-6-6V3h14zM12 13v9" />
            <path d="M9 7l2 3-2 3" />
          </svg>
        </div>
      </div>

      <div class="warning-text">${data.warningText || "ប្រយ័ត្នបាក់បែក ឬ សើម"}</div>

      ${data.senderPhone ? `<div class="sender-text">ផ្ញើរ: ${data.senderPhone}</div>` : ""}
    </div>

    <div class="middle-section">
      <div class="receiver-phone" style="${(data.receiverPhone || '').length > 15 ? 'font-size: 26px;' : (data.receiverPhone || '').length > 12 ? 'font-size: 29px;' : ''}">${data.receiverPhone || "—"}</div>

      ${(() => {
        const hasCity = !!(data.city && data.city.trim());
        const hasBranch = !!(data.branch && data.branch.trim());
        if (!hasCity && !hasBranch) return "";
        if (hasCity && hasBranch) {
          const lowerCity = data.city.toLowerCase().trim();
          const lowerBranch = data.branch.toLowerCase().trim();
          if (lowerBranch.includes(lowerCity)) {
            return `<div class="destination-text"><span class="branch-part">${data.branch}</span></div>`;
          }
          if (data.singleLineLocation !== false) {
            return `<div class="destination-text"><span class="city-part">${data.city}</span><span class="loc-sep"> — </span><span class="branch-part">${data.branch}</span></div>`;
          }
          return `<div class="city-text">${data.city}</div><div class="branch-text">${data.branch}</div>`;
        }
        return `<div class="destination-text"><span class="branch-part">${data.branch || data.city}</span></div>`;
      })()}

      ${data.showCod && data.codAmount ? `
        <div>
          <div class="cod-badge">ប្រមូលប្រាក់ / COD: ${data.codAmount}</div>
        </div>
      ` : ""}
    </div>

    ${(data.showCustomerName || data.showOrderId || (data.showItems && data.itemsSummary)) ? `
      <div class="extra-section">
        ${data.showCustomerName && data.customerName ? `
          <div class="extra-row">
            <span>អតិថិជន / Customer:</span>
            <span>${data.customerName}</span>
          </div>
        ` : ""}
        ${data.showOrderId && data.orderId ? `
          <div class="extra-row">
            <span>វិក្កយបត្រ / Order:</span>
            <span>${data.orderId}</span>
          </div>
        ` : ""}
        ${data.showItems && data.itemsSummary ? `
          <div class="extra-row" style="font-size: 12.5px;">
            <span>ទំនិញ / Items:</span>
            <span style="max-width: 65%; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${data.itemsSummary}</span>
          </div>
        ` : ""}
      </div>
    ` : "<div></div>"}
  </div>

  <script>
    function triggerAutoPrint() {
      window.focus();
      try {
        window.print();
      } catch (e) {
        console.warn("Print trigger error:", e);
      }
    }
    if (document.readyState === "complete") {
      setTimeout(triggerAutoPrint, 250);
    } else {
      window.addEventListener("load", function() {
        setTimeout(triggerAutoPrint, 250);
      });
    }
  </script>
</body>
</html>`;

  // If window mode requested explicitly (e.g. from New Tab button or sandboxed preview), open print popup directly
  if (mode === "window") {
    try {
      const win = window.open("", "_blank");
      if (win) {
        win.document.open();
        win.document.write(html);
        win.document.close();
        return;
      }
    } catch (err) {
      console.warn("window.open failed, falling back to background iframe:", err);
    }
  }

  // Remove any previously appended print frame
  const existingFrame = document.getElementById("a5-package-label-print-frame");
  if (existingFrame && existingFrame.parentNode) {
    existingFrame.parentNode.removeChild(existingFrame);
  }

  // Create a visible-dimensioned off-screen iframe so the browser's layout & print engine does not discard it
  const iframe = document.createElement("iframe");
  iframe.id = "a5-package-label-print-frame";
  iframe.style.position = "fixed";
  iframe.style.top = "0";
  iframe.style.left = "0";
  iframe.style.width = "210mm";
  iframe.style.height = "297mm";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  iframe.style.border = "none";
  iframe.style.zIndex = "-9999";
  document.body.appendChild(iframe);

  let printExecuted = false;
  const executePrint = () => {
    if (printExecuted) return;
    printExecuted = true;

    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.warn("Direct iframe print failed, trying window.open fallback:", err);
      try {
        const win = window.open("", "_blank");
        if (win) {
          win.document.open();
          win.document.write(html);
          win.document.close();
        }
      } catch (e2) {
        toast.error("Could not trigger print dialog. Please check popup permissions.");
      }
    }

    // Clean up iframe after print dialog resolves
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 6000);
  };

  // 1. Hook up onload BEFORE writing content
  iframe.onload = () => {
    setTimeout(executePrint, 250);
  };

  // 2. Open and write the HTML document
  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();
  }

  // 3. Guaranteed backup trigger in case iframe onload was bypassed or fired synchronously
  setTimeout(executePrint, 600);
}

interface PackageLabelA5DialogProps {
  order?: AdminOrder | null;
  initialData?: Partial<PackageLabelPrintData> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PackageLabelA5Dialog = ({ order, initialData, open, onOpenChange }: PackageLabelA5DialogProps) => {
  const [warningText, setWarningText] = useState("ប្រយ័ត្នបាក់បែក ឬ សើម");
  const [senderPhone, setSenderPhone] = useState("087 75 3939");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [city, setCity] = useState("Phnom Penh");
  const [branch, setBranch] = useState("");
  const [courier, setCourier] = useState("None");
  const [customerName, setCustomerName] = useState("");
  const [orderId, setOrderId] = useState("");
  const [codAmount, setCodAmount] = useState("");
  const [itemsSummary, setItemsSummary] = useState("");
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [paperSize, setPaperSize] = useState<"a5" | "a4" | "thermal_100x150" | "thermal_76x130">("a5");
  const [smartPasteText, setSmartPasteText] = useState("");

  const receiverPhoneInputRef = useRef<HTMLInputElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const branchInputRef = useRef<HTMLInputElement>(null);

  // Quick Smart Paste & Auto-fill
  const handleSmartPaste = (rawText: string) => {
    if (!rawText || !rawText.trim()) return;
    const trimmed = rawText.trim();

    // 1. Extract phone number
    const phoneMatch = trimmed.match(/(?:(?:\+?855|0)[1-9][0-9\s\-]{6,12})/);
    if (phoneMatch) {
      const cleanPhone = phoneMatch[0].replace(/[\s\-]/g, '');
      setReceiverPhone(cleanPhone);
    }

    // 2. Parse address, province, and courier
    const parsed = parseCustomerLocation(trimmed);
    if (parsed.city) setCity(parsed.city);
    if (parsed.branch) setBranch(parsed.branch);
    if (parsed.detectedCourier) setCourier(parsed.detectedCourier);

    toast.success("Customer data parsed & auto-filled!");
    setSmartPasteText("");
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        handleSmartPaste(text);
      } else {
        toast.error("Clipboard is empty");
      }
    } catch {
      toast.error("Please paste directly into the box");
    }
  };

  const handleClearForm = () => {
    setReceiverPhone("");
    setCity("Phnom Penh");
    setBranch("");
    setCourier("None");
    setCustomerName("");
    setCodAmount("");
    setSmartPasteText("");
    toast.info("Cleared fields for next entry");
    receiverPhoneInputRef.current?.focus();
  };

  // Optional display toggles
  const [showCustomerName, setShowCustomerName] = useState(false);
  const [showOrderId, setShowOrderId] = useState(false);
  const [showCod, setShowCod] = useState(false);
  const [showItems, setShowItems] = useState(false);
  const [singleLineLocation, setSingleLineLocation] = useState(true);

  // Reusable function to apply order data dynamically
  const applyOrderData = useCallback((orderToUse: AdminOrder, fromApi = false) => {
    // 1. Dynamic customer phone extraction
    const phone = resolveCustomerPhone(orderToUse);
    if (phone) {
      setReceiverPhone(phone);
    }

    // 2. Customer full name
    const name = orderToUse.customer?.full_name || orderToUse.user?.full_name || (orderToUse as any).customer_name || "";
    if (name) {
      setCustomerName(name);
    }

    // 3. Formatted Order / Invoice ID
    const formattedId = `#${orderToUse.id.slice(0, 8).toUpperCase()}`;
    setOrderId(formattedId);

    // 4. Dynamic address & Cambodian province parser
    const rawAddress = resolveCustomerAddress(orderToUse);
    const parsedLoc = parseCustomerLocation(rawAddress, orderToUse.notes);

    setCity(parsedLoc.city);
    setBranch(parsedLoc.branch);

    if (parsedLoc.detectedCourier) {
      setCourier(parsedLoc.detectedCourier);
    }

    // 5. COD calculation
    const isUnpaid = orderToUse.status !== "paid" && orderToUse.status !== "cancelled";
    if (isUnpaid) {
      const amt = typeof orderToUse.amount === "string" ? parseFloat(orderToUse.amount) : orderToUse.amount;
      const paid = (orderToUse.payments || []).reduce((s: number, p: any) => s + (typeof p.amount === "string" ? parseFloat(p.amount) : p.amount), 0);
      const remaining = Math.max(0, amt - paid);
      if (remaining > 0) {
        setCodAmount(`$${remaining.toFixed(2)}`);
        setShowCod(false);
      } else {
        setCodAmount("");
        setShowCod(false);
      }
    } else {
      setCodAmount("");
      setShowCod(false);
    }

    // 6. Items summary
    if (orderToUse.items && orderToUse.items.length > 0) {
      setItemsSummary(orderToUse.items.map(i => `${i.product_name} ×${i.quantity}`).join(", "));
    } else if (orderToUse.product_name) {
      setItemsSummary(orderToUse.product_name);
    }

    if (fromApi) {
      toast.success(`Synced customer info from Invoice ${formattedId}`);
    }
  }, []);

  // Fetch full order detail from backend API to ensure authoritative customer profile & address
  const syncFromApi = useCallback(async (targetOrderId: string) => {
    if (!targetOrderId) return;
    setIsLoadingDetail(true);
    try {
      const res = await adminUsersApi.getOrderDetail(targetOrderId);
      if (res?.order) {
        applyOrderData(res.order, true);
      }
    } catch (err) {
      console.warn("Could not fetch detailed order:", err);
    } finally {
      setIsLoadingDetail(false);
    }
  }, [applyOrderData]);

  // Initialize fields whenever order or initialData changes or opens
  useEffect(() => {
    if (!open) return;

    // 1. Fetch store phone from branding
    getInvoiceBranding().then(b => {
      if (b.support_phone?.trim()) {
        setSenderPhone(b.support_phone.trim());
      } else {
        setSenderPhone("087 75 3939");
      }
    }).catch(() => {
      setSenderPhone("087 75 3939");
    });

    if (initialData) {
      if (initialData.warningText) setWarningText(initialData.warningText);
      if (initialData.senderPhone) setSenderPhone(initialData.senderPhone);
      if (initialData.receiverPhone) setReceiverPhone(initialData.receiverPhone);

      // If city isn't specified in initialData, dynamically parse from branch/address
      if (initialData.city) {
        setCity(initialData.city);
        if (initialData.branch) setBranch(initialData.branch);
      } else if (initialData.branch) {
        const parsed = parseCustomerLocation(initialData.branch);
        setCity(parsed.city);
        setBranch(parsed.branch);
        if (parsed.detectedCourier && !initialData.courier) {
          setCourier(parsed.detectedCourier);
        }
      }

      if (initialData.courier) setCourier(initialData.courier);
      if (initialData.customerName) setCustomerName(initialData.customerName);
      if (initialData.orderId) setOrderId(initialData.orderId);
      if (initialData.codAmount) {
        setCodAmount(initialData.codAmount);
        setShowCod(true);
      }
      if (initialData.itemsSummary) {
        setItemsSummary(initialData.itemsSummary);
        setShowItems(true);
      }
      return;
    }

    if (!order) return;

    // First apply what we have from table row
    applyOrderData(order, false);

    // Then asynchronously fetch authoritative details if order has an ID
    if (order.id) {
      syncFromApi(order.id);
    }
  }, [order, initialData, open, applyOrderData, syncFromApi]);

  const handlePrint = (mode: "auto" | "window" = "auto") => {
    printA5PackageLabel({
      warningText,
      senderPhone,
      receiverPhone,
      city,
      branch,
      customerName,
      orderId,
      courier,
      codAmount,
      itemsSummary,
      showCustomerName,
      showOrderId,
      showCod,
      showItems,
      singleLineLocation,
      logoUrl: "/realtech-logo.png",
      siteName: "REALTECH",
      paperSize,
    }, mode);
    toast.success(mode === "window" ? "Opening label in new tab..." : "Opening print dialog...");
  };

  return (
    <AdminDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        <div className="flex items-center justify-between w-full pr-6">
          <span className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-500" />
            Print A5 Package Label
          </span>
          {order?.id && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs text-muted-foreground border-amber-500/30">
                Invoice #{order.id.slice(0, 8).toUpperCase()}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                onClick={() => syncFromApi(order.id)}
                disabled={isLoadingDetail}
                title="Re-fetch fresh customer location & number from invoice"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDetail ? "animate-spin text-amber-500" : ""}`} />
                <span>{isLoadingDetail ? "Syncing..." : "Re-sync"}</span>
              </Button>
            </div>
          )}
        </div>
      }
      description="Print high-visibility fragile shipping label formatted for A5 packages & boxes with dynamic customer details"
      className="max-w-4xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Left Column: Customization Controls */}
        <div className="lg:col-span-6 space-y-4 max-h-[72vh] overflow-y-auto pr-1">
          {/* Warning Headline */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Warning Text (អក្សរប្រយ័ត្ន)
            </Label>
            <div className="flex gap-2">
              <Input
                value={warningText}
                onChange={(e) => setWarningText(e.target.value)}
                placeholder="ប្រយ័ត្នបាក់បែក ឬ សើម"
                className="font-medium text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {WARNING_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setWarningText(preset)}
                  className={`text-[11px] px-2 py-0.5 rounded-full border transition-all ${
                    warningText === preset
                      ? "bg-amber-500/15 border-amber-500/40 text-amber-800 dark:text-amber-300 font-semibold"
                      : "bg-muted/40 border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Sender Phone */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-primary" />
                Sender Phone (លេខអ្នកផ្ញើរ)
              </Label>
              <button
                type="button"
                onClick={() => setSenderPhone("087 75 3939")}
                className="text-[11px] text-primary hover:underline"
              >
                Set to 087 75 3939
              </button>
            </div>
            <Input
              value={senderPhone}
              onChange={(e) => setSenderPhone(e.target.value)}
              placeholder="e.g. 087 75 3939"
              className="font-mono text-sm font-semibold"
            />
          </div>

          {/* Recipient Phone */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Recipient Phone (លេខអ្នកទទួល - Large & Bold)
              </Label>
              {receiverPhone && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" /> Dynamic from invoice
                </span>
              )}
            </div>
            <Input
              value={receiverPhone}
              onChange={(e) => setReceiverPhone(e.target.value)}
              placeholder="e.g. 069696397"
              className="font-mono text-base font-bold text-foreground tracking-wide"
            />
            {!receiverPhone && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Info className="w-3 h-3" /> No phone number found on invoice. Type recipient phone above.
              </p>
            )}
          </div>

          {/* City / Province */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                Destination / City (ខេត្ត / ក្រុង)
              </Label>
              {city && (
                <span className="text-[10px] text-muted-foreground">
                  Quick select or type custom
                </span>
              )}
            </div>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Phnom Penh, Sihanoukville, Siem Reap..."
              className="font-semibold text-sm"
            />
            {/* Quick province chips */}
            <div className="flex flex-wrap gap-1 pt-0.5">
              {POPULAR_PROVINCES.map((prov) => (
                <button
                  key={prov}
                  type="button"
                  onClick={() => setCity(prov)}
                  className={`text-[11px] px-2 py-0.5 rounded-md border transition-all ${
                    city.toLowerCase() === prov.toLowerCase()
                      ? "bg-primary text-primary-foreground border-primary font-medium"
                      : "bg-muted/40 border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {prov}
                </button>
              ))}
            </div>
          </div>

          {/* Delivery Branch / Address */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-500" />
                Branch / Depot / Address (សាខា / ឃ្លាំង / ទីតាំងទទួល)
              </Label>
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <span className="text-[11px] text-muted-foreground font-medium">Keep on 1 line:</span>
                <Switch
                  checked={singleLineLocation}
                  onCheckedChange={setSingleLineLocation}
                  className="scale-75 origin-right"
                />
              </label>
            </div>
            <Input
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="e.g. Khan Toul Kork, St 271 / ឃ្លាំងឯករាជ្យ / ផ្សារលើ..."
              className="font-medium text-sm"
            />
          </div>

          {/* Courier Transport Option */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-indigo-500" />
              Courier Service (ក្រុមហ៊ុនដឹកជញ្ជូន)
            </Label>
            <Select value={courier} onValueChange={setCourier}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select courier" />
              </SelectTrigger>
              <SelectContent>
                {COURIER_PRESETS.map((c) => (
                  <SelectItem key={c} value={c} className="text-xs">
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Extra options accordions / toggles */}
          <div className="border border-border/80 rounded-lg p-3 bg-muted/20 space-y-2.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Additional Package Details (Optional)
            </span>

            {/* COD Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="toggle-cod" className="text-xs cursor-pointer flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  COD / Collect on Delivery (ប្រមូលប្រាក់)
                </Label>
                {showCod && (
                  <Input
                    value={codAmount}
                    onChange={(e) => setCodAmount(e.target.value)}
                    placeholder="e.g. $35.00"
                    className="h-7 text-xs font-mono font-bold mt-1 w-36"
                  />
                )}
              </div>
              <Switch id="toggle-cod" checked={showCod} onCheckedChange={setShowCod} />
            </div>

            {/* Customer Name Toggle */}
            <div className="flex items-center justify-between pt-1 border-t border-border/60">
              <div className="space-y-0.5">
                <Label htmlFor="toggle-name" className="text-xs cursor-pointer flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  Show Customer Name
                </Label>
                {showCustomerName && (
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer name"
                    className="h-7 text-xs mt-1 w-44"
                  />
                )}
              </div>
              <Switch id="toggle-name" checked={showCustomerName} onCheckedChange={setShowCustomerName} />
            </div>

            {/* Order # Toggle */}
            <div className="flex items-center justify-between pt-1 border-t border-border/60">
              <div className="space-y-0.5">
                <Label htmlFor="toggle-orderid" className="text-xs cursor-pointer flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                  Show Order #
                </Label>
                {showOrderId && (
                  <Input
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="#ORD-..."
                    className="h-7 text-xs font-mono mt-1 w-36"
                  />
                )}
              </div>
              <Switch id="toggle-orderid" checked={showOrderId} onCheckedChange={setShowOrderId} />
            </div>

            {/* Items Summary Toggle */}
            <div className="flex items-center justify-between pt-1 border-t border-border/60">
              <div className="space-y-0.5">
                <Label htmlFor="toggle-items" className="text-xs cursor-pointer flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-muted-foreground" />
                  Show Package Content
                </Label>
                {showItems && (
                  <Input
                    value={itemsSummary}
                    onChange={(e) => setItemsSummary(e.target.value)}
                    placeholder="e.g. MacBook Pro M2"
                    className="h-7 text-xs mt-1 w-52"
                  />
                )}
              </div>
              <Switch id="toggle-items" checked={showItems} onCheckedChange={setShowItems} />
            </div>
          </div>
        </div>

        {/* Right Column: Live A5 Sheet Preview */}
        <div className="lg:col-span-6 flex flex-col items-center justify-between bg-muted/40 p-4 rounded-xl border border-border/80">
          <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-border/60 text-xs text-muted-foreground">
            <span className="font-semibold flex items-center gap-1.5">
              <Package className="w-4 h-4 text-amber-500" /> A5 Package Label Preview
            </span>
            <Badge variant="outline" className="text-[10px] font-mono">
              148 × 210 mm (A5)
            </Badge>
          </div>

          {/* Realistic A5 Paper Surface */}
          <div className="w-full max-w-[340px] aspect-[1/1.414] bg-white text-black shadow-lg rounded-sm border border-neutral-300 p-5 flex flex-col items-center justify-between text-center select-none overflow-hidden my-auto">
            {courier && courier !== "None" && (
              <div className="mb-1">
                <span className="border-2 border-black px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider">
                  {courier}
                </span>
              </div>
            )}

            {/* Brand Logo & Name */}
            <div className="flex items-center justify-center gap-1.5 mb-1 shrink-0">
              <img src="/realtech-logo.png" alt="Logo" className="w-5 h-5 object-contain" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
              <span className="font-extrabold text-[12px] uppercase tracking-wider text-black">Realtech</span>
            </div>

            {/* Warning Triangle & Fragile Broken Glass Symbol */}
            <div className="my-1 flex items-center justify-center gap-3 shrink-0">
              <WarningTriangleSvg className="w-20 h-16" />
              <svg viewBox="0 0 24 24" className="w-9 h-9 text-black shrink-0" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M8 22h8M19 3v4c0 3.31-2.69 6-6 6h-2c-3.31 0-6-2.69-6-6V3h14zM12 13v9" />
                <path d="M9 7l2 3-2 3" />
              </svg>
            </div>

            {/* Warning Text */}
            <div className="font-extrabold text-[15px] text-black leading-tight tracking-wide px-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
              {warningText || "ប្រយ័ត្នបាក់បែក ឬ សើម"}
            </div>

            {/* Sender Phone */}
            {senderPhone && (
              <div className="font-bold text-[13px] text-black tracking-normal whitespace-nowrap">
                ផ្ញើរ: {senderPhone}
              </div>
            )}

            {/* Recipient Phone (Big & Prominent - Guaranteed Single Line) */}
            <div className="font-black text-[22px] tracking-wide text-black font-sans my-0.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
              {receiverPhone || "000 000 000"}
            </div>

            {/* Destination / City & Branch - Stays on one single line */}
            {(city || branch) && (
              <div className="font-extrabold text-[16px] text-black leading-snug px-1 my-0.5 max-w-full">
                {city && branch && !branch.toLowerCase().includes(city.toLowerCase()) ? (
                  singleLineLocation ? (
                    <div className="flex items-center justify-center gap-1.5 truncate">
                      <span className="font-bold text-neutral-800">{city}</span>
                      <span className="text-neutral-400 font-normal">—</span>
                      <span className="font-black text-black">{branch}</span>
                    </div>
                  ) : (
                    <>
                      <div className="font-bold text-[14px] text-neutral-800">{city}</div>
                      <div className="font-extrabold text-[16px] text-black">{branch}</div>
                    </>
                  )
                ) : (
                  <div className="truncate font-black text-black">{branch || city}</div>
                )}
              </div>
            )}

            {/* COD Badge */}
            {showCod && codAmount && (
              <div className="mt-1">
                <span className="bg-black text-white px-2.5 py-0.5 rounded font-black text-xs">
                  ប្រមូលប្រាក់ / COD: {codAmount}
                </span>
              </div>
            )}

            {/* Optional Footer Details */}
            {(showCustomerName || showOrderId || (showItems && itemsSummary)) && (
              <div className="w-full pt-1.5 mt-1 border-t border-dashed border-black/80 text-[10px] font-medium text-left space-y-0.5">
                {showCustomerName && customerName && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">អតិថិជន:</span>
                    <span className="font-bold">{customerName}</span>
                  </div>
                )}
                {showOrderId && orderId && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">វិក្កយបត្រ:</span>
                    <span className="font-mono font-bold">{orderId}</span>
                  </div>
                )}
                {showItems && itemsSummary && (
                  <div className="flex justify-between truncate">
                    <span className="text-neutral-600">ទំនិញ:</span>
                    <span className="font-bold truncate max-w-[180px]">{itemsSummary}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Button Bar */}
          <div className="w-full flex items-center justify-end gap-2 pt-4 mt-3 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground border-border/80"
              onClick={() => handlePrint("window")}
              title="Open print preview in a dedicated browser tab (useful if iframe printing is restricted)"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              New Tab Print
            </Button>
            <Button
              type="button"
              size="sm"
              className="gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-sm"
              onClick={() => handlePrint("auto")}
            >
              <Printer className="w-4 h-4" />
              Print A5 Label
            </Button>
          </div>
        </div>
      </div>
    </AdminDialog>
  );
};
