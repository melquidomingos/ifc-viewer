# IFC Viewer — BIM Web

Visualizador 3D de arquivos IFC construído com **React + Vite + Three.js + web-ifc-three**.
Publicado via **GitHub Pages** com deploy automático pelo GitHub Actions.

---

## 🌐 Acesso online

Após publicar no GitHub, a aplicação estará disponível em:

```
https://SEU_USUARIO.github.io/ifc-viewer/
```

---

## 🚀 Como publicar no GitHub (passo a passo)

### 1. Criar o repositório

- Acesse github.com → clique em **New**
- Nome: `ifc-viewer`
- Visibilidade: **Public**
- **Não** marque nenhuma opção extra (sem README, sem .gitignore)
- Clique em **Create repository**

### 2. Fazer upload dos arquivos

- Dentro do repositório criado, clique em **"uploading an existing file"**
- Arraste **todos os arquivos e pastas** do projeto (ou o .zip)
- Mensagem do commit: `primeiro commit`
- Clique em **Commit changes**

### 3. Ativar o GitHub Pages

- Vá em **Settings** → **Pages** (menu lateral)
- Em **Source**, selecione **Deploy from a branch**
- Branch: **gh-pages** → pasta: **/ (root)**
- Clique em **Save**

### 4. Aguardar o deploy automático

- Vá na aba **Actions** do repositório
- Aguarde o workflow terminar (ícone verde ✅)
- Acesse: `https://SEU_USUARIO.github.io/ifc-viewer/`

> **Da próxima vez:** qualquer alteração que você enviar para a branch `main` dispara o deploy automaticamente.

---

## 🖱️ Controles de navegação

| Ação       | Input                         |
|------------|-------------------------------|
| Órbita     | Clique esquerdo + arrastar    |
| Pan        | Clique direito + arrastar     |
| Zoom       | Scroll do mouse               |
| Hover      | Mover mouse sobre o modelo    |
| Selecionar | Clicar em elemento do modelo  |

---

## ⚙️ Funcionalidades

- ✅ Upload de arquivo `.ifc` local
- ✅ Renderização 3D do modelo IFC
- ✅ Orbit / Pan / Zoom com damping
- ✅ Iluminação ambiente + direcional + hemisférica
- ✅ Grid no chão e AxesHelper (XYZ)
- ✅ Câmera se ajusta automaticamente ao modelo
- ✅ Hover highlight (azul)
- ✅ Seleção de elemento (laranja) + ExpressID na barra
- ✅ Compatível com GitHub Pages via coi-serviceworker

---

## 📁 Estrutura do projeto

```
ifc-viewer/
├── .github/
│   └── workflows/
│       └── deploy.yml          ← deploy automático no GitHub Pages
├── public/
│   ├── coi-serviceworker.js    ← resolve CORS/WASM no GitHub Pages
│   └── web-ifc.wasm            ← copiado automaticamente no npm install
├── scripts/
│   └── copy-wasm.cjs
├── src/
│   ├── components/
│   │   ├── IFCViewer.jsx
│   │   └── IFCViewer.module.css
│   ├── lib/
│   │   ├── SceneSetup.js
│   │   └── IFCLoader.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
└── vite.config.js
```

---

## 🔧 Rodar localmente (opcional)

```bash
npm install
npm run dev
# Acesse http://localhost:5173
```

