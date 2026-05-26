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

/**
 * Normaliza e busca a entrada de produto completa de um código no catálogo do Google Sheets.
 * Trata variações como sufixos entre parênteses, espaços ou letras extras.
 */
export function getFallbackProduct(
  code: string,
  catalog: Record<string, ProductDBEntry>
): ProductDBEntry | null {
  if (!catalog || !code) return null;
  
  const upperCode = code.trim().toUpperCase();
  
  // 1. Busca direta (ex: "7349")
  if (catalog[upperCode]) {
    return catalog[upperCode];
  }
  
  // 2. Remove parênteses e conteúdo dentro, ex: "7349 (D)" ou "7349 (H)" -> "7349"
  const withoutParentheses = upperCode.replace(/\s*\(.*\)/g, "").trim();
  if (catalog[withoutParentheses]) {
    return catalog[withoutParentheses];
  }
  
  // 3. Pega apenas a primeira palavra/token, ex: "7349 D" -> "7349"
  const firstWord = upperCode.split(/\s+/)[0].trim();
  if (catalog[firstWord]) {
    return catalog[firstWord];
  }
  
  // 4. Remove uma única letra no final de código numérico, ex: "7349D" -> "7349"
  const numericMatch = upperCode.match(/^(\d+)[A-Z]$/);
  if (numericMatch) {
    const baseCode = numericMatch[1];
    if (catalog[baseCode]) {
      return catalog[baseCode];
    }
  }
  
  return null;
}

/**
 * Normaliza e busca a descrição de um código de produto no catálogo do Google Sheets.
 */
export function getFallbackDescription(
  code: string,
  catalog: Record<string, ProductDBEntry>
): string | null {
  const prod = getFallbackProduct(code, catalog);
  return prod ? prod.description : null;
}

/**
 * Retorna a descrição a ser exibida. Se a descrição atual for vazia ou for um marcador
 * padrão ("Importado", "Sem descrição"), tenta buscar o fallback no catálogo do Google Sheets.
 */
export function resolveDescription(
  currentDescription: string | undefined,
  code: string,
  catalog: Record<string, ProductDBEntry>
): string {
  const desc = currentDescription?.trim();
  const hasNoDescription = 
    !desc || 
    desc === "Importado" || 
    desc === "Sem descrição" || 
    desc === "Sem descrio" || 
    desc === "Sem descriï¿½ï¿½o" || 
    desc === "Sem descrio" ||
    desc === "Sem descrio";
    
  if (hasNoDescription && catalog) {
    const fallback = getFallbackDescription(code, catalog);
    if (fallback) return fallback;
  }
  
  return desc || "Sem descrição";
}

