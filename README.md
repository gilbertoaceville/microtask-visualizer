# Microtask Visualizer

An interactive tool to visualize JavaScript's event loop — including how **microtasks** and **macrotasks** are scheduled and executed.

---

## 🚀 Quick Start

```bash
# Create project
npx create-react-app microtask-visualizer
cd microtask-visualizer

# Install dependencies
npm install lucide-react

# Install Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Run the development server
npm start
```
---

## ⚙️ Setup

### 1. Configure Tailwind

Edit tailwind.config.js:

```javascript
export default {
  content: ["./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

### 2. Update CSS

Replace src/index.css with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 3. Add Component

Create:

```javascript
src/visualizer.jsx
```
and add the visualizer component code.

### 4. Update App

Replace the contents of src/App.jsx with:

```javascript
import MicrotaskVisualizer from "./page/visualizer";

function App() {
  return <MicrotaskVisualizer />
}

export default App
```
---

## 🌟 Features

### Visualizes:
- Call stack  
- Microtask queue  
- Macrotask queue  

### Other Features:
- Paste custom JavaScript code  
- Step-by-step execution  
- Auto-run mode  

### Supports:
- Promises  
- async/await  
- setTimeout  
- queueMicrotask  

---

## 🧪 Usage

1. Click **"Paste Code"** to enter JavaScript.  
2. Try built-in examples or write your own.  
3. Click **"Step Forward"** to walk through execution.  
4. Watch how the event loop processes each task.

---

## 📦 Build

```bash
npm run build
```
---

## 📄 License

### MIT