import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  serverUrl: string;
  setServerUrl: (url: string) => void;
}

const DEFAULT_SERVER = '192.168.1.95:3001';

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  serverUrl: DEFAULT_SERVER,
  setServerUrl: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [serverUrl, setServerUrl] = useState(() => {
    const saved = localStorage.getItem('serverUrl');
    return saved || DEFAULT_SERVER;
  });

  useEffect(() => {
    localStorage.setItem('serverUrl', serverUrl);
    
    if (socket) {
      socket.close();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const newSocket = io(`${protocol}${serverUrl}`);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.log('Connection error:', error);
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [serverUrl]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, serverUrl, setServerUrl }}>
      {children}
    </SocketContext.Provider>
  );
};