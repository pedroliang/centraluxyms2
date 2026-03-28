# Resumo do Projeto - Centralux YMS

Este documento resume as atividades realizadas para a configuração e ajuste do sistema Centralux YMS.

## 1. Configuração Inicial e Repositório
- **Clonagem**: O repositório `pedroliang/centraluxyms2` foi clonado para o diretório local.
- **Branch**: Alternamos para a branch `main` para acessar o código-fonte completo (Vite/React).

## 2. Ajustes de Cálculos de Produtos
- **Nova Lógica**: Implementamos cálculos automáticos baseados na proporção por caixa (`Q/Cx`):
  - `Q.Unit / Q/Cx` ➔ `Caixas` (Total)
  - `Unt.SP / Q/Cx` ➔ `Cx.SP`
  - `Unt.DF / Q/Cx` ➔ `Cx.DF`
- **Sincronismo**: Alterar o valor de `Q/Cx` agora dispara o recálculo imediato de todos os campos de caixas.
- **Decimais**: O banco de dados foi atualizado para suportar casas decimais (tipo `NUMERIC`), garantindo precisão nos cálculos.

## 3. Limpeza de Interface (UI)
- **Remoção do Volume**: O campo "Vol." e a coluna de Volume foram removidos de:
  - Formulário de Adição de Produto.
  - Tabela de Itens (Dashboard).
  - Geração de PDF.
  - Modo de Impressão.

## 4. Novo Ambiente Supabase
- **Projeto Novo**: Foi criado um projeto Supabase exclusivo: `lbqprihivhehutomrzbr` (Centralux YMS).
- **Schema**: Atualizamos o esquema do banco para incluir colunas de SP/DF que estavam faltando na migração original.
- **Configuração**: O arquivo `.env` foi atualizado com as novas credenciais.

## 5. Recuperação de Dados
- **Migração**: Realizamos a migração de 36 processos e 324 produtos do banco de dados antigo para o novo.
- **Integridade**: Todos os dados históricos foram preservados e agora estão acessíveis no novo ambiente.

## Próximos Passos
- O sistema está totalmente funcional com a nova lógica de cálculos.
- O repositório GitHub está sincronizado com o código mais recente e as migrações do Supabase.

---
**Data da última atualização:** 28/03/2026
**Responsável:** Antigravity (AI)
