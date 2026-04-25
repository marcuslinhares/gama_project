# Spec: Sistema de Autenticação via WhatsApp (Evolution API)

## 1. Objetivo
Implementar um sistema de autenticação sem senha (passwordless) focado no lojista B2B, utilizando o número de telefone como identificador único e validação via código OTP (One-Time Password) enviado pelo WhatsApp através da Evolution API.

## 2. Arquitetura de Autenticação
O sistema utiliza um fluxo de duas etapas com persistência temporária do código no banco de dados e emissão de token JWT para sessões autenticadas.

### A. Solicitação de Código (`POST /api/auth/request`)
- **Entrada:** `{ "phone": "5588999999999" }`
- **Lógica:**
    1. Verifica se o telefone pertence a um usuário pré-cadastrado na tabela `users`.
    2. Gera um código numérico aleatório de 6 dígitos.
    3. Salva o código e o timestamp de expiração (5 minutos) no registro do usuário.
    4. Dispara uma mensagem via **Evolution API** para o WhatsApp do lojista.
- **Saída:** Sucesso (200 OK) ou Erro (ex: Usuário não encontrado).

### B. Verificação de Código (`POST /api/auth/verify`)
- **Entrada:** `{ "phone": "5588999999999", "code": "123456" }`
- **Lógica:**
    1. Busca o usuário pelo telefone.
    2. Compara o código enviado com o armazenado.
    3. Verifica se o código não expirou.
    4. Se válido, limpa o código do banco e gera um **Token JWT** (contendo `userId` e `distributorId`).
- **Saída:** `{ "token": "...", "user": { "id", "name", "phone" } }`

## 3. Modelo de Dados (PostgreSQL)

### Tabela `users` (ou `clients`)
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Identificador único. |
| `phone` | VARCHAR (Unique) | Número de telefone com DDI (ex: 55889...). |
| `name` | VARCHAR | Nome do lojista ou razão social. |
| `distributor_id` | UUID (FK) | Referência ao distribuidor dono do cliente. |
| `otp_code` | VARCHAR(6) | Código de verificação pendente. |
| `otp_expires_at` | TIMESTAMP | Data/Hora de expiração do código. |

## 4. Integração Evolution API
- **Serviço:** `evolution.service.ts` no backend.
- **Variáveis de Ambiente:**
    - `EVOLUTION_URL`: Endereço da API.
    - `EVOLUTION_KEY`: Chave de autenticação global.
    - `EVOLUTION_INSTANCE`: Nome da instância que enviará as mensagens.
- **Payload de Envio:**
    ```json
    {
      "number": "5588999999999",
      "text": "Seu código de acesso ao Marketplace B2B é: 123456"
    }
    ```

## 5. Interface do Usuário (PWA)
1. **Página de Login:**
    - Input de telefone com máscara brasileira.
    - Botão "Receber Código via WhatsApp".
2. **Página de Verificação:**
    - 6 inputs de dígito único com auto-focus.
    - Timer de reenvio (60 segundos).
3. **Persistência:** Token JWT armazenado em `localStorage` com interceptor no Axios/Fetch para cabeçalho `Authorization`.

## 6. Estratégia de Testes
- **Backend:** Mock da Evolution API para testar geração e validação de OTP.
- **Integração:** Teste de fluxo completo com usuário pré-existente no banco.
