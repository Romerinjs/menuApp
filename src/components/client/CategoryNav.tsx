import React from 'react';
import { Category } from '../../types/restaurant';
import { CategoryIcon } from '../common/CategoryIcon';

interface CategoryNavProps {
  categories: Category[];
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory
}) => {
  return (
    <nav className="sticky-category-nav">
      <div className="category-nav-inner">
        {categories.map((cat) => {
          const isActive = activeCategoryId === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`nav-pill ${isActive ? 'active' : ''}`}
            >
              <CategoryIcon iconName={cat.icon} size={15} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
