import { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../context/DoctorContext'

const Chat = ({ roomId, patient, onClose }) => {
    const { socket, dToken, backendUrl } = useContext(DoctorContext)
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (socket && roomId) {
            socket.emit('joinRoom', roomId)

            // Load previous messages
            fetchMessages()

            socket.on('receiveMessage', (message) => {
                setMessages(prev => [...prev, message])
            })

            return () => {
                socket.off('receiveMessage')
            }
        }
    }, [socket, roomId])

    const fetchMessages = async () => {
        try {
            const response = await fetch(`${backendUrl}/api/chat/doctor/messages/${roomId}`, {
                headers: { dToken }
            })
            const data = await response.json()
            if (data.success) {
                setMessages(data.messages)
            }
        } catch (error) {
            console.error('Error fetching messages:', error)
        } finally {
            setLoading(false)
        }
    }

    const sendMessage = async () => {
        if (!newMessage.trim() || !socket) return

        try {
            const response = await fetch(`${backendUrl}/api/chat/doctor/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    dToken,
                },
                body: JSON.stringify({ roomId, message: newMessage }),
            })
            const data = await response.json()
            if (!data.success) {
                console.error('Doctor message failed:', data.message)
                return
            }

            const outgoing = {
                ...data.chat,
                timestamp: data.chat.createdAt || Date.now(),
            }

            socket.emit('sendMessage', {
                roomId,
                message: data.chat.message,
                senderId: data.chat.senderId,
                senderType: data.chat.senderType,
                createdAt: data.chat.createdAt,
            })

            setMessages((prev) => [...prev, outgoing])
            setNewMessage('')
        } catch (error) {
            console.error('Error sending doctor message:', error)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage()
        }
    }

    if (loading) return <div className="text-center">Loading chat...</div>

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md h-96 flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <div>
                        <h3 className="text-lg font-semibold">Chat with {patient?.name || 'Patient'}</h3>
                        {patient?.email && <p className="text-xs text-gray-500">{patient.email}</p>}
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {messages.map((msg, index) => {
                        const timeValue = msg.createdAt || msg.timestamp
                        const time = timeValue ? new Date(timeValue) : null
                        return (
                            <div key={index} className={`p-2 rounded ${msg.senderType === 'doctor' ? 'bg-green-100 self-end' : 'bg-gray-100'}`}>
                                <p>{msg.message}</p>
                                <small className="text-gray-500">{time ? time.toLocaleTimeString() : ''}</small>
                            </div>
                        )
                    })}
                </div>
                <div className="p-4 border-t flex">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1 border rounded-l px-3 py-2"
                    />
                    <button onClick={sendMessage} className="bg-green-500 text-white px-4 py-2 rounded-r hover:bg-green-600">
                        Send
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Chat