import React, { useState, useEffect } from 'react';
import { PersonalGoal, FinancialGoal, WeeklyTask } from '../types';
import Modal from './common/Modal';
import Input from './common/Input';
import Button from './common/Button';

interface WeeklyCheckinProps {
  personalGoals: PersonalGoal[];
  financialGoal: FinancialGoal;
  onClose: () => void;
  onSubmit: (savedAmount: number, completedTasks: string[]) => void;
}

const CheckboxIcon = () => (
    <svg className="h-4 w-4 text-brand-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
)

const WeeklyCheckin: React.FC<WeeklyCheckinProps> = ({ personalGoals, financialGoal, onClose, onSubmit }) => {
  const [savedAmount, setSavedAmount] = useState<number>(financialGoal.weeklySavingsTarget);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  
  const weekNumber = personalGoals.length > 0 ? personalGoals[0].currentWeek : 1;

  useEffect(() => {
    // Pre-populate with tasks that are already marked as completed in the main UI
    const preCompleted = personalGoals.flatMap(goal => 
        (goal.taskHistory[goal.currentWeek - 1] || [])
            .filter(task => task.completed)
            .map(task => task.id)
    );
    setCompletedTasks(preCompleted);
  }, [personalGoals]);


  const handleTaskToggle = (taskId: string) => {
    setCompletedTasks(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(savedAmount, completedTasks);
    onClose();
  };
  
  const TaskItem: React.FC<{task: WeeklyTask}> = ({ task }) => {
      const isChecked = completedTasks.includes(task.id);
      return (
        <label key={task.id} className="flex items-center bg-card p-4 rounded-md cursor-pointer hover:bg-accent transition-colors">
          <div className="relative flex items-center">
              <input 
              type="checkbox"
              checked={isChecked}
              onChange={() => handleTaskToggle(task.id)}
              className="appearance-none h-5 w-5 rounded-md border-2 border-input checked:bg-brand checked:border-brand focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-card focus:ring-ring transition-all"
              />
              {isChecked && <div className="absolute left-0.5 top-0.5 pointer-events-none"><CheckboxIcon /></div>}
          </div>
          <span className={`ml-4 ${isChecked ? 'text-foreground' : 'text-muted-foreground'}`}>{task.description}</span>
        </label>
      )
  }

  return (
    <Modal title={`Week ${weekNumber} Check-in`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-heading mb-2 text-foreground">Financial Progress</h3>
          <Input 
            label={`How much did you save this week? (Target: £${financialGoal.weeklySavingsTarget})`}
            type="number"
            value={savedAmount}
            onChange={(e) => setSavedAmount(Number(e.target.value))}
            prefix="£"
          />
        </div>
        <div>
          <h3 className="text-lg font-heading mb-2 text-foreground">Personal Progress</h3>
          <p className="text-sm text-muted-foreground mb-3">Confirm the tasks you completed for Week {weekNumber}:</p>
          <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
            {personalGoals.map(goal => {
              const currentTasks = goal.taskHistory[goal.currentWeek - 1] || [];
              if (currentTasks.length === 0) return null;

              return (
                <div key={goal.id}>
                    <h4 className="font-semibold text-md text-foreground mb-2 pl-1">{goal.description}</h4>
                    <div className="space-y-3">
                      {currentTasks.map(task => <TaskItem key={task.id} task={task} />)}
                    </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="flex justify-end pt-4 space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary">Complete Week & Get New Plans</Button>
        </div>
      </form>
    </Modal>
  );
};

export default WeeklyCheckin;
