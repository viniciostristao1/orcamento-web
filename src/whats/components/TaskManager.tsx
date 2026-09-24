import React, { useState, useEffect } from 'react';
import { Clock, Plus, Minus, Trash2, Car, Hash, MessageSquare, Edit2, Check, X } from 'lucide-react';
import { Task } from '../types';

interface TaskManagerProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>, durationMinutes: number) => void;
  onRemoveTask: (id: string) => void;
  onAdjustTime: (id: string, minutes: number) => void;
  onUpdateDescription: (id: string, description: string) => void;
  onUpdatePlate: (id: string, plate: string) => void;
  onUpdateModel: (id: string, model: string) => void;
}

const TaskCountdown: React.FC<{ endTime: number }> = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState<number>(endTime - Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = endTime - Date.now();
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  if (timeLeft <= 0) {
    return <span className="text-rose-500 font-extrabold animate-pulse tracking-tight text-sm px-3 py-1 bg-rose-500/10 rounded-lg border border-rose-500/20">FINALIZADO</span>;
  }

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <span className="font-mono text-xl font-extrabold text-slate-100 tracking-tight">
      {hours > 0 ? `${hours}h ` : ''}{String(minutes).padStart(2, '0')}m {String(seconds).padStart(2, '0')}s
    </span>
  );
};

const TaskManager: React.FC<TaskManagerProps> = ({ 
  tasks, 
  onAddTask, 
  onRemoveTask, 
  onAdjustTime, 
  onUpdateDescription,
  onUpdatePlate,
  onUpdateModel
}) => {
  const [plate, setPlate] = useState('');
  const [model, setModel] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'plate' | 'model' | 'description' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [selectedMinutes, setSelectedMinutes] = useState(0);

  const handleAddTask = () => {
    if (!plate && !model) {
      alert('Por favor, preencha ao menos a placa ou o modelo.');
      return;
    }
    if (selectedMinutes <= 0) {
      alert('Por favor, selecione um tempo para a tarefa.');
      return;
    }
    onAddTask({ plate, model, description, endTime: 0 }, selectedMinutes);
    setPlate('');
    setModel('');
    setDescription('');
    setSelectedMinutes(0);
  };

  const addTime = (mins: number) => {
    setSelectedMinutes(prev => prev + mins);
  };

  const clearTime = () => {
    setSelectedMinutes(0);
  };

  const formatSelectedTime = (totalMinutes: number) => {
    if (totalMinutes === 0) return '0m';
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${mins > 0 ? `${mins}m` : ''}`.trim();
  };

  const startEditing = (task: Task, field: 'plate' | 'model' | 'description') => {
    setEditingId(task.id);
    setEditingField(field);
    setEditValue(task[field] || '');
  };

  const saveEdit = (id: string) => {
    if (editingField === 'description') {
      onUpdateDescription(id, editValue);
    } else if (editingField === 'plate') {
      onUpdatePlate(id, editValue.toUpperCase());
    } else if (editingField === 'model') {
      onUpdateModel(id, editValue);
    }
    setEditingId(null);
    setEditingField(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingField(null);
  };

  const sortedTasks = [...tasks].sort((a, b) => a.endTime - b.endTime);
  const today = new Date();

  return (
    <div className="bg-slate-900/60 p-6 sm:p-10 rounded-[2rem] shadow-2xl border border-slate-800 transition-all relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 relative z-10">
        <div className="flex items-center gap-6">
          <div className="bg-blue-600 p-4 rounded-3xl shadow-xl shadow-blue-900/30 border border-blue-500/30">
            <Clock className="text-white" size={40} />
          </div>
          <div>
            <div className="flex flex-wrap items-baseline gap-4">
              <h2 className="titulo-tema text-4xl font-extrabold uppercase tracking-tight text-slate-100 leading-none">Agenda de Tarefas</h2>
              <span className="uppercase tracking-widest text-sm font-bold text-slate-500">
                {today.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mt-2">Controle Operacional Weiand</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
        {[
          { label: 'Placa', icon: Hash, value: plate, setter: (v: string) => setPlate(v.toUpperCase()), placeholder: 'ABC-1234' },
          { label: 'Modelo', icon: Car, value: model, setter: setModel, placeholder: 'Toyota Corolla' },
          { label: 'Observação', icon: MessageSquare, value: description, setter: setDescription, placeholder: 'Detalhes do serviço...' }
        ].map((field) => (
          <div key={field.label} className="space-y-2.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
              <field.icon size={12} className="text-slate-400" /> {field.label}
            </label>
            <input
              type="text"
              value={field.value}
              onChange={(e) => field.setter(e.target.value)}
              placeholder={field.placeholder}
              className="w-full campo-tema border border-slate-800 rounded-2xl px-6 py-4 text-slate-100 font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 transition-all placeholder:text-slate-700"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-12 relative z-10">
        {[15, 30, 60, 1440].map((mins) => (
          <button
            key={mins}
            onClick={() => addTime(mins)}
            className="group flex flex-col items-center justify-center gap-1.5 py-5 bg-slate-950/50 hover:bg-slate-800/40 border border-slate-800 hover:border-slate-600 rounded-2xl transition-all active:scale-95 shadow-sm hover:shadow-md cursor-pointer"
          >
            <span className="text-xl font-black text-slate-300 group-hover:text-white transition-colors">
              +{mins >= 60 ? (mins === 1440 ? '24h' : `${mins / 60}h`) : `${mins}m`}
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">
              Adicionar
            </span>
          </button>
        ))}
        
        <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 flex flex-col items-center justify-center group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-700 opacity-30"></div>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Cronômetro</p>
          <div className="flex items-center gap-2.5">
            <span className="text-xl font-black text-slate-100">
              {formatSelectedTime(selectedMinutes)}
            </span>
            {selectedMinutes > 0 && (
              <button 
                onClick={clearTime} 
                className="text-slate-600 hover:text-rose-400 transition-colors"
                title="Limpar tempo"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        <button
          onClick={handleAddTask}
          disabled={selectedMinutes === 0}
          className="px-4 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-extrabold uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-blue-900/30 active:scale-95 flex flex-col items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus size={24} strokeWidth={3} />
          <span className="text-[10px] font-bold">Gerar Tarefa</span>
        </button>
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-3 custom-scrollbar relative z-10">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-20 bg-slate-950/40 border-2 border-dashed border-slate-800 rounded-[2rem]">
            <div className="bg-slate-950 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-800">
              <Clock className="text-slate-600" size={32} />
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Pátio limpo: Sem tarefas pendentes</p>
          </div>
        ) : (
          sortedTasks.map((task) => (
            <div
              key={task.id}
              className="bg-slate-900/40 border border-slate-800 rounded-xl px-4 py-2 flex flex-col xl:flex-row items-center justify-between gap-4 hover:bg-slate-800/60 hover:border-slate-600 transition-all group/card relative"
            >
              <div className="flex items-center gap-4 w-full xl:w-auto">
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 shrink-0">
                  <Car className="text-slate-500 group-hover/card:text-white transition-colors" size={18} />
                </div>
                
                <div className="flex items-center gap-6 flex-1">
                  {/* Edição de Placa */}
                  <div className="min-w-[90px]">
                    {editingId === task.id && editingField === 'plate' ? (
                      <div className="flex items-center gap-1">
                        <input
                          autoFocus
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value.toUpperCase())}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(task.id);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          className="campo-tema border border-slate-600 rounded-md px-2 py-0.5 text-slate-100 font-black text-sm focus:outline-none w-24"
                        />
                        <button onClick={() => saveEdit(task.id)} className="text-slate-100"><Check size={14} /></button>
                      </div>
                    ) : (
                      <span 
                        onClick={() => startEditing(task, 'plate')}
                        className="text-lg font-black text-slate-100 tracking-tighter cursor-pointer hover:text-slate-400 transition-all"
                      >
                        {task.plate || '---'}
                      </span>
                    )}
                  </div>

                  <span className="h-6 w-px bg-slate-800 hidden sm:block"></span>

                  {/* Edição de Modelo */}
                  <div className="min-w-[120px]">
                    {editingId === task.id && editingField === 'model' ? (
                      <div className="flex items-center gap-1">
                        <input
                          autoFocus
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(task.id);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          className="campo-tema border border-slate-600 rounded-md px-2 py-0.5 text-slate-100 font-bold text-xs focus:outline-none w-32"
                        />
                        <button onClick={() => saveEdit(task.id)} className="text-slate-100"><Check size={14} /></button>
                      </div>
                    ) : (
                      <span 
                        onClick={() => startEditing(task, 'model')}
                        className="text-slate-400 font-bold text-sm cursor-pointer hover:text-slate-100 transition-all block max-w-[180px] truncate"
                      >
                        {task.model || 'MODELO'}
                      </span>
                    )}
                  </div>
                  
                  <span className="h-6 w-px bg-slate-800 hidden sm:block"></span>
                  
                  {/* Edição de Observação */}
                  <div className="flex-1 min-w-[200px]">
                    {editingId === task.id && editingField === 'description' ? (
                      <div className="flex items-center gap-1 w-full">
                        <input
                          autoFocus
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(task.id);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          className="flex-1 campo-tema border border-slate-600 rounded-md px-2 py-0.5 text-slate-100 font-bold text-xs focus:outline-none"
                        />
                        <div className="flex items-center gap-1">
                          <button onClick={() => saveEdit(task.id)} className="text-slate-100 p-1"><Check size={14} /></button>
                          <button onClick={cancelEdit} className="text-slate-500 hover:text-rose-400 p-1"><X size={14} /></button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group/obs cursor-pointer" onClick={() => startEditing(task, 'description')}>
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-tight truncate max-w-md">
                          {task.description || 'ADICIONAR OBS'}
                        </span>
                        <Edit2 size={10} className="text-slate-600 group-hover/obs:text-slate-200 opacity-0 group-hover/obs:opacity-100 transition-all" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full xl:w-auto justify-between xl:justify-end">
                <div className="flex items-center gap-1">
                  {[30, 60, 1440].map((m) => (
                    <button
                      key={m}
                      onClick={() => onAdjustTime(task.id, m)}
                      className="px-1.5 py-0.5 campo-tema hover:bg-slate-700 text-[8px] font-extrabold text-slate-400 hover:text-white border border-slate-800 rounded transition-all active:scale-95"
                    >
                      +{m >= 60 ? (m === 1440 ? '24h' : `${m / 60}h`) : `${m}m`}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 campo-tema px-2 py-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => onAdjustTime(task.id, -5)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <div className="text-center min-w-[90px]">
                    <TaskCountdown endTime={task.endTime} />
                  </div>
                  <button
                    onClick={() => onAdjustTime(task.id, 5)}
                    className="p-1 text-slate-500 hover:text-white transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="text-center min-w-[60px] border-l border-slate-800 px-3">
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-black text-slate-100 leading-none">
                      {new Date(task.endTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[8px] font-bold text-slate-500 mt-0.5">
                      {new Date(task.endTime).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => onRemoveTask(task.id)}
                  className="p-2 text-slate-600 hover:text-rose-400 transition-colors"
                  title="Finalizar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskManager;
