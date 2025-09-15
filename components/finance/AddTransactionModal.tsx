import React, { useState } from 'react';
import { NewTransaction } from '../../types';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';

interface AddTransactionModalProps {
  onComplete: (data: NewTransaction) => void;
  onClose: () => void;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ onComplete, onClose }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim() && amount && category.trim()) {
        onComplete({
            description: description.trim(),
            amount: Math.abs(Number(amount)),
            type,
            category: category.trim(),
            date,
        });
    }
  };
  
  return (
    <Modal title="Add a New Transaction" onClose={onClose}>
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
                label="Description" 
                name="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="e.g., Weekly Groceries" 
                required 
            />
            <div className="grid grid-cols-2 gap-4">
                <Input 
                    label="Amount" 
                    type="number" 
                    name="amount" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))} 
                    prefix="£" 
                    required 
                    step="0.01"
                />
                <Input 
                    label="Date" 
                    type="date" 
                    name="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    required 
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Type</label>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setType('expense')}
                        className={`flex-1 p-3 rounded-md border text-sm font-semibold transition-colors ${type === 'expense' ? 'bg-destructive/20 border-destructive text-destructive-foreground' : 'border-input hover:bg-accent'}`}
                    >
                        Expense
                    </button>
                     <button
                        type="button"
                        onClick={() => setType('income')}
                        className={`flex-1 p-3 rounded-md border text-sm font-semibold transition-colors ${type === 'income' ? 'bg-success/20 border-success text-success' : 'border-input hover:bg-accent'}`}
                    >
                        Income
                    </button>
                </div>
            </div>

            <Input 
                label="Category" 
                name="category" 
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
                placeholder="e.g., Food, Transport" 
                required 
            />

            <div className="flex items-center justify-end mt-6 space-x-4">
                <Button type="button" onClick={onClose} variant="outline">Cancel</Button>
                <Button type="submit" variant="primary">Add Transaction</Button>
            </div>
        </form>
    </Modal>
  );
};

export default AddTransactionModal;