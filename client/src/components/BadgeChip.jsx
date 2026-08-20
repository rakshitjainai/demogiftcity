import React from 'react';

/**
 * BadgeChip component for tags, regulators, difficulty, status
 */
export default function BadgeChip({
  label,
  variant = 'default', // 'default' | 'forest' | 'leaf' | 'gold' | 'mint' | 'blue' | 'red' | 'amber'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon,
  className = ''
}) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  const variantClasses = {
    default: 'bg-gray-100 text-gray-700 border-gray-200',
    forest: 'bg-forest/10 text-forest border-forest/20 font-semibold',
    leaf: 'bg-leaf/10 text-leaf border-leaf/20 font-semibold',
    gold: 'bg-amber-100 text-amber-900 border-amber-300 font-semibold',
    mint: 'bg-mint text-forest border-mint-deep font-semibold',
    blue: 'bg-sky-100 text-sky-800 border-sky-200 font-semibold',
    red: 'bg-red-100 text-red-800 border-red-200 font-semibold',
    amber: 'bg-amber-50 text-amber-800 border-amber-200'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses[size] || sizeClasses.md} ${
        variantClasses[variant] || variantClasses.default
      } ${className}`}
    >
      {Icon && <Icon className="w-3 h-3 flex-shrink-0" />}
      <span>{label}</span>
    </span>
  );
}
