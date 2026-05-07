import { useContext, useEffect, useRef, useState } from 'react'
import { AppContext } from '../context/AppContext'

const VideoCall = ({ roomId, onClose, isInitiator = false, remoteLabel = 'Other person' }) => {
    const { socket } = useContext(AppContext)
    const [localStream, setLocalStream] = useState(null)
    const [remoteStream, setRemoteStream] = useState(null)
    const [peerConnection, setPeerConnection] = useState(null)
    const [connected, setConnected] = useState(false)
    const localVideoRef = useRef()
    const remoteVideoRef = useRef()

    useEffect(() => {
        let pc
        const handleVideoOffer = async (offer) => {
            if (!pc) return
            await pc.setRemoteDescription(new RTCSessionDescription(offer))
            const answer = await pc.createAnswer()
            await pc.setLocalDescription(answer)
            socket.emit('videoAnswer', { roomId, answer })
        }

        const handleVideoAnswer = async (answer) => {
            if (!pc) return
            await pc.setRemoteDescription(new RTCSessionDescription(answer))
        }

        const handleIceCandidate = async (candidate) => {
            if (!pc) return
            try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate))
            } catch (e) {
                console.error('Error adding ICE candidate:', e)
            }
        }

        const initializeCall = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                setLocalStream(stream)
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream
                }

                pc = new RTCPeerConnection({
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' }
                    ]
                })
                setPeerConnection(pc)

                stream.getTracks().forEach(track => pc.addTrack(track, stream))

                pc.ontrack = (event) => {
                    setRemoteStream(event.streams[0])
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = event.streams[0]
                    }
                    setConnected(true)
                }

                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        socket.emit('iceCandidate', { roomId, candidate: event.candidate })
                    }
                }

                if (isInitiator) {
                    const offer = await pc.createOffer()
                    await pc.setLocalDescription(offer)
                    socket.emit('videoOffer', { roomId, offer })
                }
            } catch (error) {
                console.error('Error initializing call:', error)
            }
        }

        if (socket && roomId) {
            socket.emit('joinRoom', roomId)
            socket.on('videoOffer', handleVideoOffer)
            socket.on('videoAnswer', handleVideoAnswer)
            socket.on('iceCandidate', handleIceCandidate)
            initializeCall()
        }

        return () => {
            if (socket) {
                socket.off('videoOffer', handleVideoOffer)
                socket.off('videoAnswer', handleVideoAnswer)
                socket.off('iceCandidate', handleIceCandidate)
            }
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop())
            }
            if (peerConnection) {
                peerConnection.close()
            }
        }
    }, [socket, roomId, isInitiator])

    const endCall = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop())
        }
        if (peerConnection) {
            peerConnection.close()
        }
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div>
                        <h3 className="text-xl font-semibold">Video Call</h3>
                        <p className="text-sm text-slate-500">Room: {roomId}</p>
                        <p className="text-sm text-slate-500">{connected ? 'Connected' : 'Waiting for participant...'}</p>
                    </div>
                    <button onClick={endCall} className="rounded-full bg-red-500 px-4 py-2 text-white hover:bg-red-600">Hang up</button>
                </div>
                <div className="flex-1 md:flex">
                    <div className="flex-1 min-h-[300px] bg-slate-900 p-4">
                        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full rounded-3xl bg-black object-cover" />
                        <p className="text-sm text-center text-slate-200 mt-3">{remoteLabel}</p>
                    </div>
                    <div className="w-full md:w-1/3 min-h-[250px] bg-slate-100 p-4 flex flex-col items-center justify-center gap-3">
                        <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full rounded-3xl bg-black object-cover" />
                        <p className="text-sm text-slate-700">You</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VideoCall