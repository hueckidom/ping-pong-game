import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import GameField from './views/Game';
import Home from './views/Home';
import Highscore from './views/EnterScore';
import ShowScores from './views/ShowScores';
import Settings from './views/Settings';
import CreateGame from './views/CreateGame';
import JoinGame from './views/JoinGame';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/game/:sessionId" element={<GameField />} />
                <Route path="/enter-score" element={<Highscore />} />
                <Route path="/scores" element={<ShowScores />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/create-game" element={<CreateGame />} />
                <Route path="/join/:sessionId" element={<JoinGame />} />
            </Routes>
        </Router>
    );
};

export default App;
