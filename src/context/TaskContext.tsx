import React, { createContext, useContext, useState, useMemo } from 'react';
import { Task, TaskStatus, TaskEvent } from '../types/task';
import { DoxoStorage } from '../lib/storage/db';
import { AnalyzedIntent } from '../lib/ai/aiService';

interface TaskContextType {
  tasks: Task[];
  activeTasks: Task[];
  completedTasks: Task[];
  dashboardTasks: Task[];
  totalTimeSavedHours: number;
  createTask: (rawPrompt: string, intent: AnalyzedIntent, providerId?: string) => Task;
  bookTask: (taskId: string, providerId: string) => void;
  updateStatus: (taskId: string, status: TaskStatus, note?: string) => void;
  submitReview: (taskId: string, rating: number, feedback?: string) => void;
  getTaskById: (id: string) => Task | undefined;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(() => DoxoStorage.getTasks());

  const activeTasks = useMemo(() => {
    return tasks.filter(t => !['completed', 'cancelled'].includes(t.status));
  }, [tasks]);

  const completedTasks = useMemo(() => {
    return tasks.filter(t => t.status === 'completed');
  }, [tasks]);

  // Max 3 tasks displayed on home dashboard according to Section 7
  const dashboardTasks = useMemo(() => {
    const active = tasks.filter(t => !['completed', 'cancelled'].includes(t.status));
    if (active.length >= 3) return active.slice(0, 3);
    const completed = tasks.filter(t => t.status === 'completed');
    return [...active, ...completed].slice(0, 3);
  }, [tasks]);

  const totalTimeSavedHours = useMemo(() => {
    const totalMinutes = tasks.reduce((sum, t) => sum + (t.timeSavedMinutes || 0), 0);
    return Math.max(1, Math.round(totalMinutes / 60));
  }, [tasks]);

  const createTask = (rawPrompt: string, intent: AnalyzedIntent, providerId?: string): Task => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newTask: Task = {
      id: `task_${Date.now()}`,
      userId: 'usr_nukri',
      title: intent.suggestedTitleEn,
      titleKa: intent.suggestedTitleKa,
      rawPrompt,
      category: intent.category,
      status: providerId ? 'booked' : 'awaiting_confirmation',
      urgency: intent.urgency,
      location: intent.location,
      preferredTime: intent.preferredTime,
      providerId,
      estimatedPrice: intent.estimatedPrice,
      aiSummary: intent.suggestedTitleEn,
      aiSummaryKa: intent.suggestedTitleKa,
      recommendedProviderIds: [],
      timeSavedMinutes: intent.timeSavedMinutes,
      timeline: [
        {
          id: `ev_${Date.now()}_1`,
          time: timeStr,
          title: 'Request analyzed by DOXO',
          titleKa: 'მოთხოვნა გააანალიზა DOXO-მ',
          actor: 'ai',
          statusAfter: 'analyzing',
        },
      ],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    DoxoStorage.saveTask(newTask);
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  };

  const bookTask = (taskId: string, providerId: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setTasks(prev => {
      return prev.map(t => {
        if (t.id !== taskId) return t;

        const bookingEvent: TaskEvent = {
          id: `ev_${Date.now()}`,
          time: timeStr,
          title: 'Specialist confirmed & booked',
          titleKa: 'სპეციალისტი დადასტურებულია',
          actor: 'user',
          statusAfter: 'booked',
        };

        const updated: Task = {
          ...t,
          providerId,
          status: 'booked',
          timeline: [...t.timeline, bookingEvent],
          updatedAt: now.toISOString(),
        };

        DoxoStorage.saveTask(updated);
        return updated;
      });
    });
  };

  const updateStatus = (taskId: string, status: TaskStatus, note?: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let titleEn = `Status updated to ${status}`;
    let titleKa = `სტატუსი განახლდა: ${status}`;

    if (status === 'provider_on_way') {
      titleEn = 'Technician on the way';
      titleKa = 'ტექნიკოსი გზაშია';
    } else if (status === 'arrived') {
      titleEn = 'Specialist arrived on site';
      titleKa = 'სპეციალისტი ადგილზეა';
    } else if (status === 'in_progress') {
      titleEn = 'Work in progress';
      titleKa = 'სამუშაო პროცესშია';
    } else if (status === 'completed') {
      titleEn = 'Task completed';
      titleKa = 'დავალება შესრულებულია';
    }

    setTasks(prev => {
      return prev.map(t => {
        if (t.id !== taskId) return t;

        const event: TaskEvent = {
          id: `ev_${Date.now()}`,
          time: timeStr,
          title: titleEn,
          titleKa,
          description: note,
          descriptionKa: note,
          actor: 'provider',
          statusAfter: status,
        };

        const updated: Task = {
          ...t,
          status,
          timeline: [...t.timeline, event],
          updatedAt: now.toISOString(),
        };

        DoxoStorage.saveTask(updated);
        return updated;
      });
    });
  };

  const submitReview = (taskId: string, rating: number, feedback?: string) => {
    setTasks(prev => {
      return prev.map(t => {
        if (t.id !== taskId) return t;
        const updated: Task = {
          ...t,
          review: {
            rating,
            feedbackText: feedback,
            createdAt: new Date().toISOString(),
          },
        };
        DoxoStorage.saveTask(updated);
        return updated;
      });
    });
  };

  const getTaskById = (id: string) => tasks.find(t => t.id === id);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        activeTasks,
        completedTasks,
        dashboardTasks,
        totalTimeSavedHours,
        createTask,
        bookTask,
        updateStatus,
        submitReview,
        getTaskById,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within TaskProvider');
  return context;
};
