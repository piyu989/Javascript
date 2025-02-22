import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../Context/SocketProvider";
import { useNavigate } from "react-router-dom";

const LobbyScreen = () => {
    const [email,setEmail] = useState("")
    const [room,setRoom] = useState("")
    
    const socket = useSocket();
    const navigate = useNavigate();

    const handleFormSubmit = useCallback((e)=>{
        e.preventDefault();
        socket.emit("room:join",{email,room})
        console.log({email,room});
    },[email,room,socket])

    const handleJoinRoom = useCallback((data) =>{
        const {email,room} = data;
        navigate(`/room/:${room}`)
        console.log(email,room,"from BE");
    },[navigate])

    useEffect(() =>{
        socket.on('room:join',handleJoinRoom);
        return () =>{
            socket.off('room:join',handleJoinRoom)
        }
    },[])

    
    return (
        <div>
            <h1>lobby screen</h1>

            <form onSubmit={handleFormSubmit}>
                <label htmlFor="email">Enter email:</label>
                <input value={email} type="email" id="email" onChange={e => setEmail(e.target.value)} />
                <br/>
                <label htmlFor="room">Enter Room id</label>
                <input value={room} type="room" id="room" onChange={e => setRoom(e.target.value)} />
                <button>join</button>
            </form>
        </div>
    )
}

export default LobbyScreen;