import { Cursor } from './Cursor'
import useWebSocket from 'react-use-websocket';
import { useEffect, useRef } from 'react';
import throttle from "lodash.throttle"

const renderCursors = users => {
    return Object
        .keys(users)
        .map(uuid => {
            const user = users[uuid]
            return <Cursor
                key={uuid}
                userId={uuid}
                point={[user.state.x, user.state.y]} />
        })
}

const renderUsersList = users => {
    return (
        <ul>
            {Object.keys(users).map(uuid => {
                return <li key={uuid}>{JSON.stringify(users[uuid])}</li>
            })}
        </ul>
    )
}

export function Home({ username }) {
    const WS_URL = `ws://127.0.0.1:8000`

    //sendJsonMessage sends message to ws server
    //lastJsonMessage receives update from ws server (reference to most recently received json message)
    const { sendJsonMessage, lastJsonMessage } = useWebSocket(WS_URL, {
        share: true,
        queryParams: { username } /** ws://127.0.0.1:8000?username=dilara */
    })

    const THROTTLE = 50 // 1000 is 1 second, 50milisecond
    // hold a reference for each render, useRef returns an object with current property, won't return the function itself
    const sendJsonMessageThrottled = useRef(throttle(sendJsonMessage, THROTTLE))


    // Send cursor position to ws server
    useEffect(() => {
        // server to send everyone's state on the second we load the component
        sendJsonMessage({
            x: 0, y: 0
        })
        window.addEventListener('mousemove', e => {
            sendJsonMessageThrottled.current({
                x: e.clientX,
                y: e.clientY
            })
        })
    }, [])

    if (lastJsonMessage) {
        return <div>
            {renderUsersList(lastJsonMessage)}
            {/* ideally batch updates */}
            {renderCursors(lastJsonMessage)}
        </div>
    }
}