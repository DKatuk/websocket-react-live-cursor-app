const http = require('http');
const { WebSocketServer } = require("ws")

const url = require('url') // from node
const uuidv4 = require('uuid').v4


const server = http.createServer()
const wsServer = new WebSocketServer({
    server
})
const port = 8000

const connections = {}
const users = {}



// you could accept message parameter but not for this app, you will only broadcast users dictionary, no need to receive message parameter
const broadcastUsers = () => {
    // send message to Each uuid
    Object.keys(connections).forEach(uuid => {
        const connection = connections[uuid]
        const message = JSON.stringify(users)
        connection.send(message)
    })

}



// everytime user moves cursor in react app, user will send a message to the ws server with cursor X Y coordinates
const handleMessage = (bytes, uuid) => {
    // client message: {"x": 50, "y": 100 } // take whole message
    const message = JSON.parse(bytes.toString())
    console.log("handleMessage_message", message, uuid)
    // lookup user dictionary and update state
    const user = users[uuid]
    user.state = message // update state

    broadcastUsers();
    console.log(`${user.username} updated their state: ${JSON.stringify(user.state)}`)
}




const handleClose = (uuid) => {
    // delete the user info from dictionary (remove the reference from objects)
    console.log(`${users[uuid].username} disconnected`,)
    delete connections[uuid]
    delete users[uuid]

    // you can implement who is disconnected  // e.g., Dilara disconnected 

    // broadcast most up-to-date dictonary to users
    broadcastUsers()
}





wsServer.on("connection", (connection, request) => {
    //idendify the user : we will be passing the username as url parameter on rontend
    // you need to accesss URL module
    // ws://localhost:8000?username=Alex 


    //pass the query string = true
    const { username } = url.parse(request.url, true).query

    //generate unique id for each user

    const uuid = uuidv4(); // new unique identifier will be generated for each user logged in
    console.log("wsServer.on_connection_username", username, uuid)


    // TRACK BOTH USER AND CONNECTION
    //every time a new connection is established store it inside of connections dictionary
    // key will be the unique identifier
    connections[uuid] = connection // assing each uuid to connection parameter of wsSocket

    // create a new user every time a connection is established
    users[uuid] = { username: username, state: {} } // create an empty state obj for each user - will be getting cursor coordinates (e.g., x: 0, y:0)
    // everytime when user moves cursor on the frontend, we are going to send an update to server to this state object

    // broadcast - fan out : send a message to every connected user

    connection.on("message", (message) => { handleMessage(message, uuid) }) // pass uuid to learn who is the user
    connection.on("close", () => { handleClose(uuid) }) // pass uuid to be able to remove/delete entries from dictionaries later on

})

// actively listening to Http server
server.listen(port, () => {
    console.log(`websocket server is running on port ${port}`)
})