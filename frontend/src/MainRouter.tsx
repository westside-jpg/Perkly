import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import BaristaScreen from './BaristaScreen'

// Киоск на / и панель бариста на /barista
export default function MainRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/barista" element={<BaristaScreen />} />
            </Routes>
        </BrowserRouter>
    )
}