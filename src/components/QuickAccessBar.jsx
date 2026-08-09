import React from 'react';
import { Settings, BookOpen, GraduationCap, Calendar, Calculator, FileText, HelpCircle, Gavel, Bell } from 'lucide-react';
import { QUICK_ACCESS_ITEMS } from '../data/mockData';

const iconMap = {
  BookOpen,
  GraduationCap,
  Calendar,
  Calculator,
  FileText,
  HelpCircle,
  Gavel,
  Bell
};

export default function QuickAccessBar({ onCustomiseClick, onItemClick, visibleItems }) {
  const itemsToRender = visibleItems || QUICK_ACCESS_ITEMS;

  return (
    <section className="py-8 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-xl">⚡</span>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Quick Access
            </h2>
          </div>

          <button
            onClick={onCustomiseClick}
            className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-reg-green px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Customise Dashboard</span>
          </button>
        </div>

        {/* 8 Equal-width White Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {itemsToRender.map((item) => {
            const IconComp = iconMap[item.icon] || BookOpen;
            return (
              <div
                key={item.id}
                onClick={() => onItemClick && onItemClick(item)}
                className="group bg-white rounded-xl p-4 border border-slate-200 hover:border-reg-green shadow-xs hover:shadow-md transition-all cursor-pointer text-center flex flex-col items-center justify-center space-y-3 transform hover:-translate-y-1"
              >
                <div className="w-11 h-11 rounded-full bg-emerald-50 group-hover:bg-reg-green text-reg-green group-hover:text-white flex items-center justify-center transition-colors shadow-xs">
                  <IconComp className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-reg-green transition-colors leading-snug">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
