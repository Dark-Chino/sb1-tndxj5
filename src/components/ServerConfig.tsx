import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export const ServerConfig: React.FC = () => {
  const { serverUrl, setServerUrl, isConnected } = useSocket();
  const [isEditing, setIsEditing] = useState(false);
  const [tempUrl, setTempUrl] = useState(serverUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerUrl(tempUrl);
    setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-4 mb-4">
      {isEditing ? (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={tempUrl}
            onChange={(e) => setTempUrl(e.target.value)}
            className="px-3 py-1 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
            placeholder="server:port"
          />
          <button
            type="submit"
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setTempUrl(serverUrl);
              setIsEditing(false);
            }}
            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Cancel
          </button>
        </form>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Server:</span>
          <span className="text-white">{serverUrl}</span>
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <Settings className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      )}
      <div className={`px-2 py-1 rounded text-sm ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
        {isConnected ? 'Connected' : 'Disconnected'}
      </div>
    </div>
  );
};