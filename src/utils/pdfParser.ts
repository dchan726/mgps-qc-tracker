import { TuItem } from '../types';
import { sanitizeItem, cleanSupplyZone } from './sanitize';

declare global {
  interface Window {
    pdfjsLib?: any;
  }
}

export const parsePdfFiles = async (
  files: File[],
  onLog: (message: string) => void
): Promise<TuItem[]> => {
  const newParsedItems: TuItem[] = [];

  const pdfjs = window.pdfjsLib;
  if (!pdfjs) {
    throw new Error("PDF.js 函式庫未成功載入，請確認網路連線。");
  }

  for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
    const file = files[fileIndex];
    onLog(`[讀取] 正解析檔案 ${fileIndex + 1}/${files.length}: ${file.name}`);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

      let currentFloor = "Block D (ONCO) - 7/F";
      let activeSupply = "";
      let activeGas = "";

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        const textItems = textContent.items
          .map((item: any) => String(item?.str || '').trim())
          .filter(Boolean);
        const fullText = textItems.join(" ");

        const floorMatch = fullText.match(/Floor:\s*([^\n|]+)/i);
        if (floorMatch) {
          currentFloor = floorMatch[1].trim();
        }

        for (let i = 0; i < textItems.length; i++) {
          const itemStr = textItems[i];

          if (itemStr.includes("AVSU") || itemStr.match(/T\d+\/\d+F\/AVSU/i)) {
            activeSupply = itemStr;
            if (itemStr.includes("OXY") || itemStr.includes("ΟΧΥ")) activeGas = "OXY";
            else if (itemStr.includes("VAC")) activeGas = "VAC";
            else if (itemStr.includes("MA4")) activeGas = "MA4";
            else if (itemStr.includes("SA7")) activeGas = "SA7";
            else if (itemStr.includes("N2O")) activeGas = "N2O";
            else if (itemStr.includes("CO2")) activeGas = "CO2";
          }

          const isTuLine = itemStr.match(/TU\/(OXY|VAC|MA4|SA7|N2O|CO2|ΟΧΥ)\/\d+/i) || itemStr.includes("/TU/");

          if (isTuLine) {
            const tuNo = itemStr.replace("ΟΧΥ", "OXY").replace(/^TS\//, "T5/");
            
            let itemGas = activeGas;
            if (tuNo.includes("/OXY/")) itemGas = "OXY";
            else if (tuNo.includes("/VAC/")) itemGas = "VAC";
            else if (tuNo.includes("/MA4/")) itemGas = "MA4";
            else if (tuNo.includes("/SA7/")) itemGas = "SA7";
            else if (tuNo.includes("/N2O/")) itemGas = "N2O";
            else if (tuNo.includes("/CO2/")) itemGas = "CO2";

            let facility = "6-Bed Room";
            let soaItem = "";

            for (let offset = -4; offset <= 4; offset++) {
              const ctx = textItems[i + offset] || "";
              if (typeof ctx === 'string' && ctx.match(/\d+\.\d+\.\d+/)) soaItem = ctx;
              if (typeof ctx === 'string' && (ctx.includes("Bed") || ctx.includes("Room") || ctx.includes("Area") || ctx.includes("Isolation") || ctx.includes("Ward"))) {
                facility = ctx;
              }
            }

            const derivedSupply = cleanSupplyZone(activeSupply, tuNo);

            const parsedRaw = {
              id: `TU-PDF-${Date.now()}-${fileIndex}-${i}-${Math.random().toString(36).substr(2, 7)}`,
              fileName: file.name || "Uploaded PDF",
              floor: currentFloor || "Block D (ONCO) - 7/F",
              supply: derivedSupply || "未分類 AVSU 閥箱",
              gasType: itemGas || "OXY",
              soaItem: soaItem || "1.11.1.01",
              facility: facility || "6-Bed Room",
              tuNo: tuNo,
              nistNo: "",
              lineValveNo: "",
              status: "Pending",
              remark: "",
              updatedAt: new Date().toISOString()
            };

            const sanitized = sanitizeItem(parsedRaw);
            if (sanitized) newParsedItems.push(sanitized);
          }
        }
      }
    } catch (err: any) {
      console.error("Parse Error:", err);
      onLog(`[錯誤] 解析檔案 ${file.name} 失敗: ${err?.message || err}`);
    }
  }

  return newParsedItems;
};
