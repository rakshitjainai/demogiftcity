import React, { useState } from 'react';
import { X, Check, Settings, GripVertical, RotateCcw } from 'lucide-react';
import { QUICK_ACCESS_ITEMS } from '../data/mockData';

export default function CustomiseDashboardModal({ visibleIds, onSave, onClose }) {
  const [selectedIds, setSelectedIds] = useState(visibleIds || QUICK_ACCESS_ITEMS.map(i => i.id));

  const toggleItem = (id) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 2) {
        setSelectedIds(selectedIds.filter(item => item !== id));
      }
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleReset = () => {
    setSelectedIds(QUICK_ACCESS_ITEMS.map(i => i.id));
  };

  const handleSave = () => {
    const updatedVisibleItems = QUICK_ACCESS_ITEMS.filter(i => selectedIds.includes(i.id));
    onSave(updatedVisibleItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-reg-green">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Customise Quick Access</h2>
              <p className="text-xs text-slate-500">Toggle shortcuts to display on your main dashboard</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options List */}
        <div className="p-5 space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {QUICK_ACCESS_ITEMS.map((item) => {
            const isChecked = selectedIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  isChecked
                    ? 'bg-emerald-50/70 border-emerald-300 text-slate-900'
                    : 'bg-slate-50/60 border-slate-200 text-slate-500 opacity-60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <GripVertical className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold">{item.label}</span>
                </div>

                <div className={`w-5 h-5 rounded-md flex items-center justify-center ${isChecked ? 'bg-reg-green text-white' : 'border border-slate-300 bg-white'}`}>
                  {isChecked && <Check className="w-3.5 h-3.5" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-reg-green hover:bg-reg-green-dark text-white text-xs font-bold shadow-md"
            >
              Save Preferences
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
