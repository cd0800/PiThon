import "./App.css";
import ComponentGallery from "./components/ComponentGallery";

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-content">
          <div className="app-title-row">
            <img
              className="app-logo-mark"
              src="/pithon-logo-mark.png"
              alt="PiThon logo mark"
            />
            <h1>PiThon UI Kit</h1>
          </div>
        </div>
      </header>
      <ComponentGallery />
    </div>
  );
}

export default App;
