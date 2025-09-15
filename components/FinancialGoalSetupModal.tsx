import React, { useState } from 'react';
import { FinancialGoalSetupData } from '../types';
import Button from './common/Button';
import Input from './common/Input';
import Modal from './common/Modal';
import Select from './common/Select';

interface FinancialGoalSetupModalProps {
  onComplete: (data: FinancialGoalSetupData) => void;
  onClose: () => void;
}

const FinancialGoalSetupModal: React.FC<FinancialGoalSetupModalProps> = ({ onComplete, onClose }) => {
  const [formData, setFormData] = useState<FinancialGoalSetupData>({
    income: 5000,
    housingCost: 1500,
    savingsGoal: 'a new laptop',
    savingsTimeline: '6 months',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'income' || name === 'housingCost' ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };
  
  return (
    <Modal title="Create Your Financial Goal" onClose={onClose}>
        <form onSubmit={handleSubmit}>
            <p className="text-muted-foreground mb-6 text-center">Let's turn your dream purchase into a reality. Our AI will create a smart, achievable savings plan just for you.</p>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
                <Input label="What do you want to save for?" name="savingsGoal" value={formData.savingsGoal} onChange={handleChange} placeholder="e.g., a new Macbook Pro" required/>
                <Select label="What's your desired timeline?" name="savingsTimeline" value={formData.savingsTimeline} onChange={handleChange} required>
                    <option>1 month</option>
                    <option>3 months</option>
                    <option>6 months</option>
                    <option>1 year</option>
                    <option>2 years</option>
                </Select>
                <Input label="Monthly take-home income?" type="number" name="income" value={formData.income} onChange={handleChange} prefix="£" required />
                <Input label="Monthly rent/housing cost?" type="number" name="housingCost" value={formData.housingCost} onChange={handleChange} prefix="£" required />
            </div>

            <p className="text-xs text-center text-muted-foreground/70 my-4">By submitting, you agree to send this data to the Gemini API for analysis.</p>

            <div className="flex items-center justify-end mt-6 space-x-4">
                <Button type="button" onClick={onClose} variant="outline">Cancel</Button>
                <Button type="submit" variant="primary">Create My Plan</Button>
            </div>
        </form>
    </Modal>
  );
};

export default FinancialGoalSetupModal;