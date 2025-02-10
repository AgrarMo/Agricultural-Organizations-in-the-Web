import { createRoot } from 'react-dom/client';
import App from './app.js';

const domNode = document.getElementById('app');
const root = createRoot(domNode);
root.render( <App />);