const {Server} = require("socket.io")

const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();

const io = new Server(8000,{
    cors:true,
});

io.on('connection',(socket) => {
    console.log('socket connected',socket.id);
    socket.on("room:join",data=>{
        const {email,room} = data;
        emailToSocketIdMap.set(email,socket.id);
        socketIdToEmailMap.set(socket.id,email);
        io.to(room).emit("user:joined",{email,id:socket.id});
        socket.join(room);
        io.to(socket.id).emit("room:join",data)
    })

    socket.on('user:call',({to,offer}) =>{
        io.to(to).emit('incoming:call',{from: socket.id, offer})
    })

    socket.on("call:accepted",({to,answer}) => {
        console.log("call accepeted",to,answer)
        io.to(to).emit('call:accepted',{from:socket.id,answer})
    })

    socket.on('peer:nego:needed',({offer,to})=>{
        console.log("inside peer:neeg:needed",offer)
        io.to(to).emit("peer:nego:needed",{from:socket.id,offer})
    })

    socket.on('peer:nego:done',({to,ans}) => {
        console.log("peer:done",to,ans)
        io.to(to).emit("peer:nego:final",{ from:socket.id,ans});
    })
})