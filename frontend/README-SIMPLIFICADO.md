# Frontend Simplificado - Tema Domiex

Este projeto foi simplificado mantendo apenas os elementos essenciais do template Domiex, preservando todos os componentes para futuro desenvolvimento.

## O que foi mantido ✅

- **Toolbar (TopBar)** - Barra superior completa com funcionalidades
- **Sidebar** - Menu lateral com navegação simplificada
- **Dashboard Analytics** - Um dashboard funcional como exemplo
- **Layout System** - Sistema completo de layout responsivo
- **Todos os componentes** - Preservados na pasta `src/components/` para uso futuro
- **Temas e estilos** - Sistema completo de temas mantido intacto

## O que foi simplificado 🔧

### Rotas (`src/routes/allRoutes.tsx`)
- Mantidas apenas as rotas essenciais:
  - `/` - Dashboard Analytics (página principal)
  - `/dashboard` - Dashboard Analytics
  - Páginas de erro (404, 500)
  - Páginas básicas de autenticação

### Menu do Sidebar (`src/data/sidebar/menu.ts`)
- Simplificado para mostrar apenas:
  - Dashboard > Analytics

### App.tsx
- Removidos dispatches desnecessários de dados
- Mantido sistema de configuração de layout

## Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/          # 🔒 TODOS OS COMPONENTES PRESERVADOS
│   ├── views/              # Views organizadas por seção
│   ├── pages/              # Páginas do projeto
│   ├── layout/             # Sistema de layout (toolbar, sidebar)
│   ├── routes/             # ✏️ Simplificado
│   ├── data/               # ✏️ Menu simplificado
│   ├── assets/             # Assets preservados
│   ├── hooks/              # Hooks customizados
│   ├── slices/             # Redux slices
│   └── utils/              # Utilitários
```

## Como executar

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## Expansão do Projeto

Para adicionar novas funcionalidades:

1. **Adicionar novas rotas**: Edite `src/routes/allRoutes.tsx`
2. **Adicionar itens ao menu**: Edite `src/data/sidebar/menu.ts`
3. **Usar componentes existentes**: Todos estão em `src/components/`
4. **Criar novas páginas**: Use as existentes como referência

## Componentes Disponíveis

O projeto inclui todos os componentes do template original:

- **UI Elements**: Buttons, Cards, Modals, Tables, Forms, etc.
- **Charts**: ApexCharts, ECharts, diversos tipos de gráficos
- **Advanced UI**: Animations, Swiper, 3D Effects, etc.
- **Icons**: Lucide, Remix Icons, Heroicons, Boxicons
- **Layout Components**: Responsive layouts, grid systems

## Temas

O sistema de temas foi preservado completamente:
- Dark/Light mode
- Cores personalizáveis
- Layout responsivo
- Múltiplos esquemas de cores

---

**Template Original**: Domiex - React TS Admin & Dashboard Template
**Simplificação**: Projeto reduzido para início rápido mantendo todos os recursos 