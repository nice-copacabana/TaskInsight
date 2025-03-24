// Import styles
import './style.css';

// Main app initialization
document.addEventListener('DOMContentLoaded', () => {
  const app = document.querySelector<HTMLDivElement>('#app');
  
  if (app) {
    // Initial content - will be replaced with V0 generated UI later
    app.innerHTML = `
      <div class="container">
        <h1>TaskInsight</h1>
        <p>AI Task Management</p>
      </div>
    `;
  }
}); 