import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Trash2, Check } from 'lucide-react';

const StudyBreakTimer = () => {
  const [studyMinutes, setStudyMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(studyMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFA==');
      audio.play().catch(() => {});
      
      if (!isBreak) {
        setIsBreak(true);
        setTimeLeft(breakMinutes * 60);
      } else {
        setIsBreak(false);
        setTimeLeft(studyMinutes * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, studyMinutes, breakMinutes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let rotation = 0;
    let scale = 1;
    let scaleDirection = 1;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      rotation += isRunning ? 0.01 : 0.005;
      scale += scaleDirection * 0.002;
      if (scale > 1.1 || scale < 0.9) scaleDirection *= -1;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);
      ctx.scale(scale, scale);

      // Draw book
      const bookWidth = 80;
      const bookHeight = 100;
      
      ctx.fillStyle = isBreak ? '#ec4899' : '#3b82f6';
      ctx.fillRect(-bookWidth/2, -bookHeight/2, bookWidth, bookHeight);
      
      ctx.fillStyle = isBreak ? '#db2777' : '#2563eb';
      ctx.fillRect(-bookWidth/2 + 5, -bookHeight/2 + 5, bookWidth - 10, bookHeight - 10);
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -bookHeight/2 + 10);
      ctx.lineTo(0, bookHeight/2 - 10);
      ctx.stroke();

      // Draw floating particles
      for (let i = 0; i < 5; i++) {
        const angle = (rotation * 2 + i * Math.PI * 2 / 5);
        const radius = 80 + Math.sin(rotation * 3 + i) * 20;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        
        ctx.fillStyle = isBreak ? '#fbbf24' : '#60a5fa';
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, isBreak]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(studyMinutes * 60);
  };

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
      setNewTask('');
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const progress = isBreak 
    ? ((breakMinutes * 60 - timeLeft) / (breakMinutes * 60)) * 100
    : ((studyMinutes * 60 - timeLeft) / (studyMinutes * 60)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-8 drop-shadow-lg">
          Study Break Timer
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Timer Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="relative h-64 mb-6">
              <canvas ref={canvasRef} className="w-full h-full" />
            </div>

            <div className="text-center mb-6">
              <div className="text-6xl font-bold text-white mb-2">
                {formatTime(timeLeft)}
              </div>
              <div className="text-xl text-white/80">
                {isBreak ? '☕ Break Time!' : '📚 Study Time'}
              </div>
            </div>

            <div className="relative h-4 bg-white/20 rounded-full mb-6 overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${isBreak ? 'bg-pink-400' : 'bg-blue-400'}`}
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex gap-4 justify-center mb-6">
              {!isRunning ? (
                <button
                  onClick={handleStart}
                  className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-110"
                >
                  <Play size={24} />
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-110"
                >
                  <Pause size={24} />
                </button>
              )}
              <button
                onClick={handleReset}
                className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-110"
              >
                <RotateCcw size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/80 text-sm mb-1 block">Study (min)</label>
                <input
                  type="number"
                  value={studyMinutes}
                  onChange={(e) => {
                    setStudyMinutes(Number(e.target.value));
                    if (!isRunning && !isBreak) setTimeLeft(Number(e.target.value) * 60);
                  }}
                  className="w-full bg-white/20 text-white rounded-lg p-2 border border-white/30"
                  min="1"
                  disabled={isRunning}
                />
              </div>
              <div>
                <label className="text-white/80 text-sm mb-1 block">Break (min)</label>
                <input
                  type="number"
                  value={breakMinutes}
                  onChange={(e) => setBreakMinutes(Number(e.target.value))}
                  className="w-full bg-white/20 text-white rounded-lg p-2 border border-white/30"
                  min="1"
                  disabled={isRunning}
                />
              </div>
            </div>
          </div>

          {/* Tasks Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">📝 Today's Tasks</h2>

            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                placeholder="Add a new task..."
                className="flex-1 bg-white/20 text-white placeholder-white/50 rounded-lg p-3 border border-white/30"
              />
              <button
                onClick={addTask}
                className="bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-lg shadow-lg transition-all transform hover:scale-105"
              >
                <Plus size={24} />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {tasks.length === 0 ? (
                <div className="text-center text-white/60 py-8">
                  No tasks yet. Add one to get started!
                </div>
              ) : (
                tasks.map(task => (
                  <div
                    key={task.id}
                    className="bg-white/10 rounded-lg p-4 flex items-center gap-3 border border-white/20 transition-all hover:bg-white/20"
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                        task.completed ? 'bg-green-500 border-green-500' : 'border-white/50'
                      }`}
                    >
                      {task.completed && <Check size={16} className="text-white" />}
                    </button>
                    <span className={`flex-1 text-white ${task.completed ? 'line-through opacity-60' : ''}`}>
                      {task.text}
                    </span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="text-white/80 text-sm">
                <div className="flex justify-between mb-2">
                  <span>Total Tasks:</span>
                  <span className="font-bold">{tasks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed:</span>
                  <span className="font-bold text-green-400">
                    {tasks.filter(t => t.completed).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-white/80 text-sm">
          💡 Tip: Use the Pomodoro technique - study for 25 minutes, break for 5!
        </div>
      </div>
    </div>
  );
};

export default StudyBreakTimer;