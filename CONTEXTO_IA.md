# 🧠 CONTEXTO_IA.md - Centralux YMS

Este arquivo serve como memória técnica para a continuação do desenvolvimento em outro ambiente.

## 📍 Status Atual (Onde paramos)
- **Repositório**: O projeto foi migrado para `pedroliang/centraluxyms2`.
- **Ambiente Local**: Dependências instaladas e servidor Vite rodando com sucesso em `http://localhost:8080/`.
- **Backup**: Foi feito um backup manual na pasta `_backup_YMS` (ignorada no Git).
- **GitHub Pages**: O deploy foi corrigido! Adicionamos o `base: "/centraluxyms2/"` no `vite.config.ts` e criamos um workflow automático no GitHub Actions (`.github/workflows/deploy.yml`).

## ⚠️ Pendências Imediatas
1. **Validar Deploy**: Verificar se a tela branca no GitHub Pages foi resolvida após o build automático (leva ~2 min após o último push).
2. **Ambiente em Casa**: No novo computador, será necessário clonar o repositório e rodar a instalação inicial.

## 🏗️ Lógica de Raciocínio
- **Arquitetura**: SPA (Single Page Application) usando **Vite + React + TypeScript**.
- **Estética**: Design Premium com Vanilla CSS (focado em Dark Mode e Glassmorphism).
- **Integração**: O sistema foi projetado para ler dados de uma planilha Google (Estoque 1) e persistir processos no **Supabase**.
- **Deploy**: O fluxo de trabalho agora é: Alterar código -> Push para `main` -> GitHub Actions faz o build e joga para a branch `gh-pages` automaticamente.

## 🚀 Próximo Passo Sugerido (Ao abrir em casa)
1. Clone o repositório: `git clone https://github.com/pedroliang/centraluxyms2.git`
2. Instale as dependências: `npm install`
3. Rode o servidor: `npm run dev`
4. **Comando para mim**: "Verifique se o site no GitHub Pages está carregando corretamente e vamos continuar a implementação das funcionalidades do YMS."

---
*Gerado em 18/03/2026 às 17:22*
