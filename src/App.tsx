import React, { useState, useEffect } from 'react';
import { Timer, TimerBox } from './components/Timer';
import { Clock } from 'lucide-react';
import { useSocket } from './context/SocketContext';
import { ServerConfig } from './components/ServerConfig';

function App() {
  const [boxes, setBoxes] = useState<Array<{ id: string; number: string; section: number }>>([]);
  const [inputNumber, setInputNumber] = useState('');
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on('init-timers', (timers: Array<{ id: string; number: string; section: number }>) => {
      setBoxes(timers);
    });

    socket.on('timer-added', (timer: { id: string; number: string; section: number }) => {
      setBoxes(prev => [...prev, timer]);
    });

    socket.on('timer-moved', ({ id, section }: { id: string; section: number }) => {
      setBoxes(prev => prev.map(box => 
        box.id === id ? { ...box, section } : box
      ));
    });

    socket.on('timer-deleted', (id: string) => {
      setBoxes(prev => prev.filter(box => box.id !== id));
    });

    return () => {
      socket.off('init-timers');
      socket.off('timer-added');
      socket.off('timer-moved');
      socket.off('timer-deleted');
    };
  }, [socket]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, sectionId: number) => {
    e.preventDefault();
    const boxId = e.dataTransfer.getData('boxId');
    setBoxes(boxes.map(box => 
      box.id === boxId ? { ...box, section: sectionId } : box
    ));
    socket?.emit('move-timer', { id: boxId, section: sectionId });
  };

  const handleAddBox = () => {
    if (/^\d{1,6}$/.test(inputNumber)) {
      const paddedNumber = inputNumber.padStart(6, '0');
      const newBox = {
        id: Date.now().toString(),
        number: paddedNumber,
        section: 1
      };
      setBoxes([...boxes, newBox]);
      socket?.emit('add-timer', newBox);
      setInputNumber('');
    } else {
      alert('Please enter up to 6 digits');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddBox();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 bg-gray-800 p-6 rounded-lg shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Clock className="w-8 h-8 text-blue-400" />
              <h1 className="text-3xl font-bold text-white">Timer Sections</h1>
            </div>
            <ServerConfig />
          </div>
          <div className="flex gap-4">
            <input
              type="text"
              value={inputNumber}
              onChange={(e) => setInputNumber(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyPress={handleKeyPress}
              placeholder="Enter up to 6 digits"
              className="px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
              maxLength={6}
            />
            <button
              onClick={handleAddBox}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add Timer
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 1)}
            data-section="1"
            className="bg-gray-800 p-6 rounded-lg min-h-[400px] border-2 border-dashed border-gray-700"
          >
            <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              30 Minutes Section
            </h2>
            {boxes.filter(box => box.section === 1).map(box => (
              <TimerBox
                key={box.id}
                id={box.id}
                number={box.number}
                initialMinutes={30}
                socket={socket}
              />
            ))}
          </div>

          <div
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 2)}
            data-section="2"
            className="bg-gray-800 p-6 rounded-lg min-h-[400px] border-2 border-dashed border-gray-700"
          >
            <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              15 Minutes Section
            </h2>
            {boxes.filter(box => box.section === 2).map(box => (
              <TimerBox
                key={box.id}
                id={box.id}
                number={box.number}
                initialMinutes={15}
                socket={socket}
              />
            ))}
          </div>

          <div
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 3)}
            data-section="3"
            className="bg-gray-800 p-6 rounded-lg min-h-[400px] border-2 border-dashed border-gray-700"
          >
            <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              10 Minutes Section
            </h2>
            {boxes.filter(box => box.section === 3).map(box => (
              <TimerBox
                key={box.id}
                id={box.id}
                number={box.number}
                initialMinutes={10}
                socket={socket}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;