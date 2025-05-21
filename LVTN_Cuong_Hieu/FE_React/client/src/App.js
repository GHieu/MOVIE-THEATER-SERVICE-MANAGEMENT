import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MovieDetailPage from './pages/MovieDetailPage';
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/movies/:id" element={<MovieDetailPage />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
