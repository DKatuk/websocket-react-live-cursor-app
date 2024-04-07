import  { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Home } from './components/Home'
import { Login } from './components/Login'

const App = () => {
  const [username, setUsername] = useState('')

  return username
    ? <Home username={username} /> /** Home comp will be running our websocket connection */
    : <Login onSubmit={setUsername} />
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />)