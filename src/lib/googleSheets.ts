import Papa from "papaparse";

export interface ProductDBEntry {
  description: string;
  qtyPerBox?: number;
  cubagem?: { x: number; y: number; z: number; peso?: string };
  lote?: string;
}

export async function fetchGoogleSheetProducts(): Promise<Record<string, ProductDBEntry>> {
  const url = import.meta.env.VITE_GOOGLE_SHEET_CSV_URL;
  
  if (!url) {
    console.warn("VITE_GOOGLE_SHEET_CSV_URL não configurada. Verifique o .env");
    return {};
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Falha ao baixar planilha");
    
    const csvData = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvData, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
          const database: Record<string, ProductDBEntry> = {};
          const rows = results.data as string[][];
          
          let headerIndex = 0;
          for (let i = 0; i < rows.length; i++) {
            if (rows[i][0] === "Cod." && rows[i][1] === "DESCRICAO") {
              headerIndex = i;
              break;
            }
          }

          const headers = rows[headerIndex] || [];
          const colCod = headers.indexOf("Cod.");
          const colDesc = headers.indexOf("DESCRICAO");
          const colPcx = headers.indexOf("P/CX");
          const colX = headers.indexOf("X (CM)");
          const colY = headers.indexOf("Y (CM)");
          const colZ = headers.indexOf("Z (CM)");
          const colPeso = headers.indexOf("PESO (KG)");
          const colLote = headers.indexOf("LOTE");

          for (let i = headerIndex + 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || !row[colCod] || !row[colDesc]) continue;

            const code = String(row[colCod]).trim();
            const description = String(row[colDesc]).trim();
            const qtyPerBox = parseInt(String(row[colPcx]), 10);
            
            const cx = parseFloat(String(row[colX]).replace(",", "."));
            const cy = parseFloat(String(row[colY]).replace(",", "."));
            const cz = parseFloat(String(row[colZ]).replace(",", "."));
            const peso = String(row[colPeso] || "").trim();
            
            database[code] = {
              description,
              qtyPerBox: isNaN(qtyPerBox) ? undefined : qtyPerBox,
              cubagem: (!isNaN(cx) && !isNaN(cy) && !isNaN(cz)) ? { x: cx, y: cy, z: cz, peso } : undefined,
              lote: row[colLote] ? String(row[colLote]).trim() : undefined,
            };
          }
          
          resolve(database);
        },
        error: (error: any) => reject(error)
      });
    });
  } catch (error) {
    console.error("Erro ao carregar Google Sheets:", error);
    return {};
  }
}
