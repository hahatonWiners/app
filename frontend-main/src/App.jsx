import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import Header from './components/Header/Header';
import AboutPage from './pages/AboutPage';
import './App.css';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/about_us" element={<AboutPage />} />
      </Routes>
    </Router>
  );
}

export default App;
