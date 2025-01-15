import './App.css';
import bold from "./assets/bold_header.png"
import Dashboard from "./Dashboard"

function App() {
  return (<>
  <header style={{
    position: 'sticky',
    top: 0,
    zindex: '1000',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100px',
    width: '100%',
    backgroundColor: 'white',
  }}>
  <img src={bold} alt="BOLD LIVE DASHBOARD" className="responsive-logo"></img>
  </header>
  <Dashboard></Dashboard>
  <footer style={{ textAlign: 'center', marginTop: '50px', fontSize: '16px', color: '#000000', fontFamily: '"Segoe UI Emoji", sans-serif' }}>
      Made with <span style={{ color: 'red' }}>❤️</span> by Build Team
    </footer>
  </>)
}

export default App
