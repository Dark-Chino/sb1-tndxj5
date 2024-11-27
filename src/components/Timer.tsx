import React, { useState, useEffect, useRef } from 'react';
import { Timer as TimerIcon } from 'lucide-react';
import { Socket } from 'socket.io-client';

interface TimerProps {
  initialMinutes: number;
  onComplete?: () => void;
  id: string;
  socket: Socket | null;
}

export const Timer: React.FC<TimerProps> = ({ initialMinutes, onComplete, id, socket }) => {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isBlinking, setIsBlinking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setTimeLeft(initialMinutes * 60);
    setIsBlinking(false);
  }, [initialMinutes]);

  useEffect(() => {
    if (socket) {
      socket.on(`timer-sync-${id}`, (data: { timeLeft: number }) => {
        setTimeLeft(data.timeLeft);
        if (data.timeLeft <= 0) {
          setIsBlinking(true);
          if (audioRef.current) {
            audioRef.current.play().catch(e => console.log('Audio play failed:', e));
          }
        }
      });

      // Request initial time from server
      socket.emit('request-time', { id });

      return () => {
        socket.off(`timer-sync-${id}`);
      };
    }
  }, [socket, id]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete?.();
      setIsBlinking(true);
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const newValue = prev - 1;
        socket?.emit('timer-update', { id, timeLeft: newValue });
        return newValue;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeLeft, onComplete, socket, id]);

  const minutes = Math.floor(Math.abs(timeLeft) / 60);
  const seconds = Math.abs(timeLeft) % 60;

  return (
    <>
      <audio ref={audioRef}>
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZRA0PVqzn77BdGAg+ltryxnMpBSl+zPLaizsIGGS57OihUBELTKXh8bllHgU2jdXzzn0vBSF1xe/glEILElyx6OyrWBUIQ5zd8sFuJAUuhM/z1YU2Bhxqvu7mnEYODlOq5O+zYBoGPJPY88p2KwUme8rx3I4+CRZiturqpVITC0mi4PK8aB8GM4nU8tGAMQYfcsLu45ZFDBFYr+ftrVoXCECY3PLEcSYELIHO8diJOQcZaLvt559NEAxPqOPwtmMcBjiP1/PMeS0GI3fH8N2RQAoUXrTp66hVFApGnt/yvmwhBTCG0fPTgjQGHW/A7eSaRQ0PVqzm77BdGAg+ltrzxnUoBSh+zPDaizsIGGS56+mjTxELTKXh8bllHgU1jdT0z3wvBSJ1xe/glEILElyx6OyrWRUIRJve8sFuJAUug8/z1YU2BRxqvu7mnEYODlOq5O+zYRsGPJPY88p3KgUme8rx3I4+CRVht+rqpVMSC0mh4PK8aiAFM4nU8tGAMQYfccPu45ZFDBFYr+ftrVwWCECY3PLEcSYGK4DN8tiIOQcZZ7zs56BODwxPpuPxtmQcBjiP1/PMeS0FI3fH8N+RQAoUXrTp66hWEwlGnt/yv2wiBDCG0fPTgzQGHm/A7eSaRQ0PVqzm77BdGAg+ltvyxnUoBSh9y/HajDsIF2W56+mjUREKTKPi8blnHgU1jdTy0HwvBSF1xe/glEQKElux6eyrWRUIRJzd8sFuJAUtg8/z1YY2BRxqvu7mnEcNDlOq5O+zYRsGOpPY88p3KgUmfMrx3I4+CRVht+rqpVMSC0mh4PK8aiAFM4nU8tGAMQYfccLu45ZGCxFYr+ftrVwXB0CY3PLEcSYGK4DN8tiIOQcZZ7zs56BODwxPpuPxtmQcBjiP1/PMeS0FI3fH8N+RQQkUXrTp66hWEwlGnt/yv2wiBDCG0fPTgzQGHm/A7eSaRQ0PVqzm77BdGAg+ltvyxnUoBSh9y/HajDsIF2W56+mjUREKTKPi8blnHgU1jdTy0HwvBSF1xe/glEQKElux6eyrWRUIRJzd8sFuJAUtg8/z1YY2BRxqvu7mnEcNDlOq5O+zYRsGOpPY88p3KgUmfMrx3I4+CRVht+rqpVMSC0mh4PK8aiAFM4nU8tGAMQYfccLu45ZGCxFYr+ftrVwXB0CY3PLEcSYGK4DN8tiIOQcZZ7zs56BODwxPpuPxtmQcBjiP1/PMeS0FI3fH8N+RQQkUXrTp66hWEwlGnt/yv2wiBDCG0fPUgzQGHm/A7eSaRQ0PVqzm77BdGAg+ltvyxnUoBSh9y/HajDsIF2W56+mjUREKTKPi8blnHgU1jdTy0HwvBSF1xe/glEQKElux6eyrWRUIRJzd8sFuJAUtg8/z1YY2BRxqvu7mnEcNDlOq5O+zYRsGOpPY88p3KgUmfMrx3I4+CRVht+rqpVMSC0mh4PK8aiAFM4nU8tGAMQYfccLu45ZGCxFYr+ftrVwXB0CY3PLEcSYGK4DN8tiIOQcZZ7zs56BODwxPpuPxtmQcBjiP1/PMeS0FI3fH8N+RQQkUXrTp66hWEwk=" type="audio/wav" />
      </audio>
      <div 
        className={`flex items-center gap-2 text-lg font-mono ${
          isBlinking ? 'animate-pulse text-red-500' : ''
        }`}
      >
        <TimerIcon className="w-5 h-5" />
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
    </>
  );
};

interface TimerBoxProps {
  id: string;
  number: string;
  initialMinutes: number;
  socket: Socket | null;
}

export const TimerBox: React.FC<TimerBoxProps> = ({ id, number, initialMinutes, socket }) => {
  const [isComplete, setIsComplete] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const touchRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  const handleDelete = () => {
    const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar este temporizador?');
    if (confirmDelete) {
      socket?.emit('timer-deleted', id);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('boxId', id);
    setIsDragging(true);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const isDroppedOutside = !e.target || !(e.target as HTMLElement).closest('[data-section]');
    if (isDroppedOutside) {
      handleDelete();
    }
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const box = boxRef.current;
    if (!box) return;

    const rect = box.getBoundingClientRect();
    touchRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      initialX: rect.left,
      initialY: rect.top,
    };

    box.style.position = 'fixed';
    box.style.zIndex = '1000';
    box.style.width = `${rect.width}px`;
    box.style.left = `${rect.left}px`;
    box.style.top = `${rect.top}px`;
    
    setIsDragging(true);
    document.body.classList.add('dragging');
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const box = boxRef.current;
    const touchData = touchRef.current;
    if (!box || !touchData) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchData.startX;
    const deltaY = touch.clientY - touchData.startY;

    box.style.left = `${touchData.initialX + deltaX}px`;
    box.style.top = `${touchData.initialY + deltaY}px`;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const box = boxRef.current;
    if (!box) return;

    setIsDragging(false);
    document.body.classList.remove('dragging');
    touchRef.current = null;

    box.style.position = '';
    box.style.zIndex = '';
    box.style.width = '';
    box.style.left = '';
    box.style.top = '';

    const touch = e.changedTouches[0];
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
    const section = dropTarget?.closest('[data-section]');

    if (section) {
      const sectionId = section.getAttribute('data-section');
      if (sectionId) {
        socket?.emit('move-timer', { id, section: parseInt(sectionId, 10) });
      }
    } else {
      handleDelete();
    }
  };

  return (
    <div
      ref={boxRef}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`
        ${isComplete ? 'bg-gray-700' : 'bg-gray-700/50'}
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        p-4 rounded-lg mb-4 cursor-move transition-all hover:shadow-lg
        border border-gray-600 hover:border-gray-500
        touch-none
      `}
    >
      <div className="flex justify-between items-center">
        <span className="text-2xl font-bold text-white">{number}</span>
        <Timer
          id={id}
          initialMinutes={initialMinutes}
          onComplete={() => setIsComplete(true)}
          socket={socket}
        />
      </div>
    </div>
  );
};