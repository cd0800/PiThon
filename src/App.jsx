import "./App.css";
import ComponentGallery from "./components/ComponentGallery";
import { Badge, Button } from "./components/ui/index.js";

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-content">
          <span className="app-kicker">PiThon UI Kit</span>
          <h1>Mathematics assignments, built for teachers.</h1>
          <p>
            A starter set of components to help you assemble quizzes, track
            progress, and support students across every unit.
          </p>
          <div className="app-header-actions">
            <Button>New assignment</Button>
            <Button variant="secondary">View classes</Button>
          </div>
        </div>
        <div className="app-header-card">
          <div className="app-header-card-top">
            <Badge label="Live" />
            <span>Today</span>
          </div>
          <div className="app-header-metric">
            <strong>28</strong>
            <span>Submissions queued</span>
          </div>
          <div className="app-header-metric">
            <strong>4.7m</strong>
            <span>Avg. solve time</span>
          </div>
        </div>
      </header>
      <ComponentGallery />
    </div>
  );
}

export default App;
