# Spec: Quality Gates e Git Hooks - Marketplace B2B Russas

## 1. Objetivo
Estabelecer barreiras automáticas de qualidade para garantir que apenas código testado, formatado e livre de vulnerabilidades conhecidas seja persistido no repositório, seguindo as melhores práticas de engenharia de software (DevOps Handbook).

## 2. Componentes do Portão de Qualidade

### A. Git Hooks (Local)
- **Ferramenta:** Husky.
- **Hook `pre-commit`:** Executa o `lint-staged` para analisar apenas os arquivos modificados.
- **Ações:** 
    - `eslint --fix`: Corrige problemas de estilo automaticamente.
    - `prettier --write`: Garante formatação consistente.
    - `npm test -- --findRelatedTests`: Roda apenas os testes impactados pelas mudanças.

### B. Verificação Estática
- **TypeScript:** Bloqueio de commits se houver erros de tipagem (`tsc --noEmit`).
- **Linter:** Regras estritas do Airbnb ou recomendadas para React/Node.

### C. Security Gate
- **Ferramenta:** `osv-scanner`.
- **Ação:** Verificação de vulnerabilidades em `package-lock.json`. Se houver CVEs críticas, o commit é abortado.

## 3. Fluxo de Trabalho do Desenvolvedor
1. Desenvolvedor altera o código.
2. Executa `git commit -m "..."`.
3. Husky dispara o script de qualidade.
4. Se o Lint falhar ou os testes quebrarem, o Git aborta a criação do commit e exibe o log de erros.
5. Desenvolvedor corrige e tenta o commit novamente.

## 4. Estratégia de Implementação
1. Instalar `husky` e `lint-staged` na raiz do projeto.
2. Configurar scripts de lint e test nos `package.json` do frontend e backend.
3. Criar o arquivo `.lintstagedrc` na raiz para orquestrar verificações multi-diretório.

## 5. Validação
- O sistema deve impedir um commit que contenha um erro de sintaxe proposital em um arquivo `.ts`.
