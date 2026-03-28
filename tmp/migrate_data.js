
const OLD_URL = "https://seusgbzwsonrgqzvmtyb.supabase.co";
const OLD_KEY = "sb_publishable_ocTsaVsMDVM-EHiswSPPIw_nHLA_e11";

const NEW_URL = "https://lbqprihivhehutomrzbr.supabase.co";
const NEW_KEY = "sb_publishable_yQivL0yO3kWztunr0ho-1g_9z6DN9D0";

async function run() {
  console.log("Iniciando recuperação de dados...");

  try {
    // 1. Fetch processes from OLD
    console.log("Buscando processos do banco antigo...");
    const resP = await fetch(`${OLD_URL}/rest/v1/processes?select=*`, {
      headers: { "apikey": OLD_KEY, "Authorization": `Bearer ${OLD_KEY}` }
    });
    if (!resP.ok) throw new Error("Erro ao buscar processos: " + await resP.text());
    const processes = await resP.json();
    console.log(`Encontrados ${processes.length} processos.`);

    // 2. Fetch products from OLD
    console.log("Buscando produtos do banco antigo...");
    const resProd = await fetch(`${OLD_URL}/rest/v1/products?select=*`, {
      headers: { "apikey": OLD_KEY, "Authorization": `Bearer ${OLD_KEY}` }
    });
    if (!resProd.ok) throw new Error("Erro ao buscar produtos: " + await resProd.text());
    const products = await resProd.json();
    console.log(`Encontrados ${products.length} produtos.`);

    // 3. Insert into NEW
    if (processes.length > 0) {
      console.log("Inserindo processos no banco novo...");
      const insP = await fetch(`${NEW_URL}/rest/v1/processes`, {
        method: "POST",
        headers: { 
          "apikey": NEW_KEY, 
          "Authorization": `Bearer ${NEW_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "resolution=merge-duplicates" 
        },
        body: JSON.stringify(processes)
      });
      if (!insP.ok) console.warn("Aviso ao inserir processos:", await insP.text());
      else console.log("Processos inseridos com sucesso.");
    }

    if (products.length > 0) {
      console.log("Inserindo produtos no banco novo...");
      const insProd = await fetch(`${NEW_URL}/rest/v1/products`, {
        method: "POST",
        headers: { 
          "apikey": NEW_KEY, 
          "Authorization": `Bearer ${NEW_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "resolution=merge-duplicates" 
        },
        body: JSON.stringify(products)
      });
      if (!insProd.ok) console.warn("Aviso ao inserir produtos:", await insProd.text());
      else console.log("Produtos inseridos com sucesso.");
    }

    console.log("Finalizado! Todos os dados foram recuperados.");
  } catch (err) {
    console.error("ERRO CRITICO:", err.message);
  }
}

run();
