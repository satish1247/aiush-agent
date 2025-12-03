import React from 'react';
import { ActionData } from '../types';

interface ActionCardProps {
  action: ActionData;
}

const ActionCard: React.FC<ActionCardProps> = ({ action }) => {
  if (!action) return null;

  let icon = '📌';
  let title = 'Action Item';
  let bgClass = 'bg-blue-50/50 border-blue-100';
  let textClass = 'text-blue-800';

  if (action.name.includes('reminder')) {
    icon = '⏰';
    title = 'Reminder Set';
    bgClass = 'bg-amber-50/50 border-amber-100';
    textClass = 'text-amber-800';
  } else if (action.name.includes('medicine')) {
    icon = '💊';
    title = 'Medicine Info';
    bgClass = 'bg-teal-50/50 border-teal-100';
    textClass = 'text-teal-800';
  } else if (action.name.includes('todo')) {
    icon = '📝';
    title = 'To-Do Added';
    bgClass = 'bg-indigo-50/50 border-indigo-100';
    textClass = 'text-indigo-800';
  }

  return (
    <div className={`p-3 rounded-2xl border ${bgClass} flex items-center gap-3 hover:bg-white transition-colors cursor-default`}>
      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-lg">
        {icon}
      </div>
      <div>
        <h4 className={`font-bold text-xs uppercase tracking-wide ${textClass}`}>{title}</h4>
        <div className="text-gray-600 text-sm">
          {action.item && <span className="font-semibold block">{action.item}</span>}
          {action.message && <span>{action.message}</span>}
          {action.time && <span className="text-xs opacity-75 block mt-0.5">@ {action.time}</span>}
        </div>
      </div>
    </div>
  );
};

export default ActionCard;