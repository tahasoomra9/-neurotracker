import React, { useState, useEffect } from 'react';
import { PersonalGoal, FinancialGoal } from '../types';
import Modal from './common/Modal';
import Input from './common/Input';
import Button from './common/Button';

interface WeeklyCheckinProps {
  personalGoal: PersonalGoal;
  financialGoal: FinancialGoal;
  onClose: () => void;
  onSubmit: (savedAmount: number, completedTasks: string[]) => void;
}

const CheckboxIcon = () => (
    <svg className="h-4 w-4 text-brand-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
)

const WeeklyCheckin: React.FC<WeeklyCheckinProps> = ({ personalGoal, financialGoal, onClose, onSubmit }) => {
  const [savedAmount, setSavedAmount] = useState<number>(financialGoal.weeklySavingsTarget);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  
  const currentTasks = personalGoal.taskHistory[personalGoal.currentWeek - 1] || [];
  
  useEffect(() => {
    // Pre-populate completed tasks from the goal state
    const preCompleted = currentTasks.filter(task => task.completed).map(task => task.id);
    setCompletedTasks(preCompleted);
  }, [personalGoal]);


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

  return (
    <Modal title={`Week ${personalGoal.currentWeek} Check-in`} onClose={onClose}>
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
          <p className="text-sm text-muted-foreground mb-3">Confirm the tasks you completed for Week {personalGoal.currentWeek}:</p>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
            {currentTasks.map(task => {
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
            )})}
          </div>
        </div>
        <div className="flex justify-end pt-4 space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary">Complete Week & Get New Plan</Button>
        </div>
      </form>
    </Modal>
  );
};

export default WeeklyCheckin;