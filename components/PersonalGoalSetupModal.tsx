import React, { useState } from 'react';
import { PersonalGoalSetupData } from '../types';
import Button from './common/Button';
import Input from './common/Input';
import Modal from './common/Modal';
import Select from './common/Select';

interface PersonalGoalSetupModalProps {
  onComplete: (data: PersonalGoalSetupData) => void;
  onClose: () => void;
}

const PersonalGoalSetupModal: React.FC<PersonalGoalSetupModalProps> = ({ onComplete, onClose }) => {
  const [formData, setFormData] = useState<PersonalGoalSetupData>({
    personalGoal: 'learn conversational Spanish',
    personalTimeline: '6 months',
    currentSkillLevel: 'Beginner',
    goalType: 'Learning',
    dailyTimeAvailable: '30 minutes',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };
  
  return (
    <Modal title="Define Your Personal Goal" onClose={onClose}>
        <form onSubmit={handleSubmit}>
            <p className="text-muted-foreground mb-6 text-center">What skill do you want to build? Tell us your goal and our AI will break it down into simple, weekly steps.</p>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
                <Input label="What personal goal do you want to achieve?" name="personalGoal" value={formData.personalGoal} onChange={handleChange} placeholder="e.g., run a 5k" required/>
                
                <Select label="Goal Type" name="goalType" value={formData.goalType} onChange={handleChange} required>
                    <option>Learning</option>
                    <option>Fitness</option>
                    <option>Creative</option>
                    <option>Career</option>
                    <option>Health</option>
                    <option>Habit Building</option>
                </Select>

                <Select label="What's your target completion timeline?" name="personalTimeline" value={formData.personalTimeline} onChange={handleChange} required>
                    <option>1 month</option>
                    <option>3 months</option>
                    <option>6 months</option>
                    <option>1 year</option>
                </Select>
                
                <Select label="What is your current skill level?" name="currentSkillLevel" value={formData.currentSkillLevel} onChange={handleChange} required>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                </Select>

                <Select label="Daily time available?" name="dailyTimeAvailable" value={formData.dailyTimeAvailable} onChange={handleChange} required>
                    <option>15 minutes</option>
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>2 hours</option>
                </Select>
            </div>

            <p className="text-xs text-center text-muted-foreground/70 my-4">By submitting, you agree to send this data for AI analysis.</p>

            <div className="flex items-center justify-end mt-6 space-x-4">
                <Button type="button" onClick={onClose} variant="outline">Cancel</Button>
                <Button type="submit" variant="primary">Create My Plan</Button>
            </div>
        </form>
    </Modal>
  );
};

export default PersonalGoalSetupModal;