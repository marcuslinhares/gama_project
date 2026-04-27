# Spec: Dark Mode com Toggle

## 1. Objetivo

Adicionar suporte a dark mode no app marketplace B2B Russas, com toggle no header e persistência por `localStorage` (fallback para `prefers-color-scheme`).

## 2. Abordagem

**Tailwind `darkMode: 'class'` + CSS custom properties nos tokens do design system.**

Tokens de cor (`primary`, `surface-*`) são redefinidos como referências a CSS vars no `tailwind.config.js`. As vars são definidas em `index.css` para `:root` (light) e `.dark` (dark). A classe `.dark` é adicionada em `document.documentElement` via JS. Resultado: classes existentes (`bg-surface-lowest`, `bg-primary`, etc.) trocam de cor automaticamente — zero refactor nos componentes para backgrounds. Texto usa variantes `dark:` do Tailwind nos componentes afetados.

## 3. Tokens de Cor

| Token              | Light     | Dark      |
|--------------------|-----------|-----------|
| `surface`          | `#f9f9ff` | `#0f172a` |
| `surface-lowest`   | `#ffffff`  | `#1e293b` |
| `surface-low`      | `#f2f3fc` | `#334155` |
| `surface-high`     | `#e7e8f0` | `#475569` |
| `surface-highest`  | `#e1e2ea` | `#64748b` |
| `primary`          | `#003f87` | `#60a5fa` |
| `primary-container`| `#0056b3` | `#3b82f6` |

## 4. Componentes

### 4.1 `ThemeContext.tsx` (novo)

```typescript
// Contrato da interface
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}
```

**Lógica de inicialização:**
1. Lê `localStorage.getItem('theme')`
2. Se `'dark'` → dark. Se `'light'` → light.
3. Se `null` → usa `window.matchMedia('(prefers-color-scheme: dark)').matches`

**Toggle:**
- Inverte `isDark`
- Salva `'dark'` ou `'light'` no localStorage
- Adiciona/remove classe `dark` em `document.documentElement`

### 4.2 `tailwind.config.js`

```js
darkMode: 'class',
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: 'var(--color-primary)',
        container: 'var(--color-primary-container)',
      },
      surface: {
        DEFAULT: 'var(--color-surface)',
        low: 'var(--color-surface-low)',
        lowest: 'var(--color-surface-lowest)',
        high: 'var(--color-surface-high)',
        highest: 'var(--color-surface-highest)',
      },
    },
  },
}
```

### 4.3 `index.css`

```css
:root {
  --color-primary: #003f87;
  --color-primary-container: #0056b3;
  --color-surface: #f9f9ff;
  --color-surface-low: #f2f3fc;
  --color-surface-lowest: #ffffff;
  --color-surface-high: #e7e8f0;
  --color-surface-highest: #e1e2ea;
}

.dark {
  --color-primary: #60a5fa;
  --color-primary-container: #3b82f6;
  --color-surface: #0f172a;
  --color-surface-low: #334155;
  --color-surface-lowest: #1e293b;
  --color-surface-high: #475569;
  --color-surface-highest: #64748b;
}
```

### 4.4 Toggle Button

Localização: header de `Home.tsx` e `AdminDashboard.tsx`, canto superior direito.

```tsx
// Ícone: Moon quando light, Sun quando dark
<button onClick={toggleTheme} className="p-2 rounded-xl bg-surface-low dark:bg-surface-low transition-colors">
  {isDark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-slate-400" />}
</button>
```

### 4.5 Texto nos Componentes

Elementos com `text-slate-900` recebem `dark:text-slate-100`.
Elementos com `text-slate-400` recebem `dark:text-slate-500`.
Elementos com `text-slate-500` recebem `dark:text-slate-400`.

Componentes afetados: `Home.tsx`, `ProductCard.tsx`, `AdminDashboard.tsx`, `AdminOrders.tsx`, `Cart.tsx`, `Checkout.tsx`, `Orders.tsx`, `Login.tsx`, `ProductDetails.tsx`, `OrderSuccess.tsx`.

## 5. Fluxo de Dados

```
ThemeProvider (main.tsx)
  └── App.tsx (consome useTheme)
        ├── Home.tsx (toggle no header)
        └── AdminDashboard.tsx (toggle no header)
```

## 6. Arquivos Modificados

| Arquivo | Ação |
|---------|------|
| `tailwind.config.js` | darkMode: 'class', cores → CSS vars |
| `src/index.css` | CSS vars `:root` + `.dark` |
| `src/main.tsx` | wrap com ThemeProvider |
| `src/App.tsx` | consome useTheme, passa para children |
| `src/context/ThemeContext.tsx` | **novo** |
| `src/pages/Home.tsx` | toggle no header + dark: variants |
| `src/pages/admin/AdminDashboard.tsx` | toggle no header + dark: variants |
| `src/components/ProductCard.tsx` | dark: variants |
| `src/pages/Cart.tsx` | dark: variants |
| `src/pages/Checkout.tsx` | dark: variants |
| `src/pages/Orders.tsx` | dark: variants |
| `src/pages/Login.tsx` | dark: variants |
| `src/pages/ProductDetails.tsx` | dark: variants |
| `src/pages/OrderSuccess.tsx` | dark: variants |
| `src/pages/admin/AdminOrders.tsx` | dark: variants |

## 7. Testes

- Toggle troca classe `.dark` no `<html>` imediatamente
- Recarregar página com dark ativo → continua dark (localStorage)
- Sem preferência salva + sistema dark → inicia dark
- Sem preferência salva + sistema light → inicia light
