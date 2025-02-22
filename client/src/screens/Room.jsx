import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../Context/SocketProvider";
import ReactPlayer from "react-player"
import peer from "../service/peer";

const RoomPage = () =>{

    const socket = useSocket();
    const [remoteSocketId,setRemoteSocketId] = useState(null);
    const [mystream,setMystream] = useState(null);
    const [remoteStream,setRemoteStream] = useState(null);

    const hanldeUserJoined = useCallback(({email,id})=>{
        console.log("hanlde user joined")
        setRemoteSocketId(id);
    },[])

    const handleCallUser = useCallback(async ()=>{
        console.log("hanlde call user")
        const stream = await navigator.mediaDevices.getUserMedia({audio:true,video:true,});
        const offer = await peer.getOffer();
        socket.emit("user:call",{to: remoteSocketId, offer});
        setMystream(stream)
    },[remoteSocketId,socket])

    const handleIncomingCall = useCallback(async ({from,offer})=>{
        console.log("handleIncomingCall")
        setRemoteSocketId(from);
        const stream = await navigator.mediaDevices.getUserMedia({audio:true,video:true,});
        setMystream(stream)
        const answer = await peer.getAnswer(offer);
        socket.emit("call:accepted",{to: from,answer});
    },[socket])

    const sendStreams = useCallback(()=>{
        for(const track of mystream.getTracks()){
            peer.peer.addTrack(track,mystream);
        }
    },[mystream])

    const handleCallAccepted = useCallback(({from,answer}) =>{
        console.log("handleCallAccepted")
        peer.setLocalDescription(answer);
        console.log('call accepted');
        sendStreams()
    },[sendStreams])

    const hanldeNegoNeeded = useCallback(async()=>{
        console.log("inside hanldeNegoNeeded")
        const offer = await peer.getOffer();
        socket.emit('peer:nego:needed',{offer,to:remoteSocketId})
    },[remoteSocketId, socket])

    useEffect(()=>{
        peer.peer.addEventListener('negotiationneeded',hanldeNegoNeeded);
        return ()=>{
            peer.peer.removeEventListener('negotiationneeded',hanldeNegoNeeded);
        }
    },[hanldeNegoNeeded]);

    const hanldNegoNeededIncoming = useCallback(async({from,offer}) =>{
        console.log("inside hanldNegoNeededIncoming")
        console.log("ram ram ji ",offer,from)
        const ans = await peer.getAnswer(offer);
        console.log("radhe radhe ",ans)
        socket.emit('peer:nego:done',{to:from,ans})
    },[socket])

    const hanldeNegoNeededFinal = useCallback(async ({from,ans})=>{
        console.log("inside hanldeNegoNeededFinal")
        await peer.setLocalDescription(ans);
    },[])


    useEffect(() => {
        peer.peer.addEventListener('track',async ev => {
            const remoteStream = ev.streams
            console.log("tracksss")
            setRemoteStream(remoteStream[0]);
        })
    },[])

    useEffect(()=>{
        socket.on('user:joined',hanldeUserJoined)
        socket.on('incoming:call',handleIncomingCall)
        socket.on("call:accepted",handleCallAccepted);
        socket.on("peer:nego:needed",hanldNegoNeededIncoming);
        socket.on("peer:nego:final",hanldeNegoNeededFinal)
        return () =>{
            socket.off("user:joined",hanldeUserJoined);
            socket.off('incoming:call',handleIncomingCall);
            socket.off("call:accepted",handleCallAccepted);
            socket.off("peer:nego:needed",hanldNegoNeededIncoming);
            socket.off("peer:nego:final",hanldeNegoNeededFinal)
        }
    },[socket,hanldeUserJoined,handleIncomingCall,handleCallAccepted,hanldNegoNeededIncoming,hanldeNegoNeededFinal])

    return (
        <div>
            <h1>Room Page</h1>
            <h2>{remoteSocketId ? 'connected':'no one in room'}</h2>
            {remoteSocketId && <button onClick={handleCallUser}>Call</button>}
            {mystream && <button onClick={sendStreams}>send stream</button>}
            <h1>
                My Stream
                {mystream && <ReactPlayer playing muted height="300px" width='500px' url={mystream}/>}
            </h1>
            <h1>
                Remote Stream
                {remoteStream && <ReactPlayer playing muted height="300px" width='500px' url={remoteStream}/>}
            </h1>
        </div>
    )
}

export default RoomPage;