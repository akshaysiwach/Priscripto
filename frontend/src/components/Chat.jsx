import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'

const Chat = ({ roomId, doctor, onClose }) => {
    const { socket, token, backendUrl } = useContext(AppContext)
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (socket && roomId) {
            socket.emit('joinRoom', roomId)

            fetchMessages()

            socket.on('receiveMessage', (message) => {
                setMessages((prev) => [...prev, message])
            })

            return () => {
                socket.off('receiveMessage')
            }
        }
    }, [socket, roomId])

    const fetchMessages = async () => {
        try {
            const response = await fetch(`${backendUrl}/api/chat/messages/${roomId}`, {
                headers: { token }
            })
            const data = await response.json()
            if (data.success) {
                setMessages(data.messages)
            }
        } catch (error) {
            console.error('Error fetching messages:', error)
            toast.error('Unable to load previous messages.')
        } finally {
            setLoading(false)
        }
    }

    const sendMessage = async () => {
        if (!newMessage.trim()) return

        try {
            const response = await fetch(`${backendUrl}/api/chat/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    token,
                },
                body: JSON.stringify({ roomId, message: newMessage }),
            })
            const data = await response.json()
            if (!data.success) {
                toast.error(data.message)
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
            console.error('Error sending message:', error)
            toast.error('Unable to send message.')
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
                        <h3 className="text-lg font-semibold">Chat with {doctor?.name || 'Doctor'}</h3>
                        {doctor?.speciality && <p className="text-xs text-gray-500">{doctor.speciality}</p>}
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {messages.length === 0 ? (
                        <p className="text-center text-gray-500">Start the conversation with your doctor.</p>
                    ) : (
                        messages.map((msg, index) => {
                            const timeValue = msg.createdAt || msg.timestamp
                            const time = timeValue ? new Date(timeValue) : null
                            return (
                                <div
                                    key={index}
                                    className={`p-2 rounded ${msg.senderType === 'patient' ? 'bg-blue-100 self-end' : 'bg-gray-100'}`}
                                >
                                    <p>{msg.message}</p>
                                    <small className="text-gray-500">{time ? time.toLocaleTimeString() : ''}</small>
                                </div>
                            )
                        })
                    )}
                </div>
                <div className="p-4 border-t flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1 border rounded px-3 py-2"
                    />
                    <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Send
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Chat