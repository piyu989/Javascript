import React, { useCallback, useEffect } from "react";
import { useSocket } from "../Context/SocketProvider";

const RoomPage = () =>{

    const socket = useSocket();

    const hanldeUserJoined = useCallback(({email,id})=>{
        30:31
        console.log(`email ${email}`)
    },[])

    useEffect(()=>{
        socket.on('user:joined',hanldeUserJoined)
        return () =>{
            socket.off("user:joined",hanldeUserJoined);
        }
    },[socket,hanldeUserJoined])

    return (
        <div>
            <h1>Room Page</h1>
        </div>
    )
}

export default RoomPage;