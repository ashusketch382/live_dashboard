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
    height: '140px',
    width: '100%',
    backgroundColor: 'white',
  }}>
  <img src={bold} alt="BOLD LIVE DASHBOARD" className="responsive-logo"></img>
  </header>
  <Dashboard></Dashboard>
  <footer style={{ textAlign: 'center', marginTop: '50px', fontSize: '16px', color: '#000000', fontFamily: '"Segoe UI Emoji", sans-serif' }}>
      <br></br>
      Made with <span style={{ color: 'red' }}>❤️</span> by Build Team
      <br></br>
      For any feedback, pelase reach out to hwa_buildteam@hcl-software.com
    </footer>
  </>)
}

export default App
