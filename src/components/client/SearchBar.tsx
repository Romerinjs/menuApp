import React, { useState } from 'react';
import { Search, X, Star, Flame, CheckCircle, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';

export type QuickFilterType = 'all' | 'featured' | 'bestseller' | 'available';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  activeFilter: QuickFilterType;
  onFilterChange: (filter: QuickFilterType) => void;
  resultsCount?: number;
  isFiltered: boolean;
  onClearAll: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  activeFilter,
  onFilterChange,
  resultsCount,
  isFiltered,
  onClearAll
}) => {
  const [showFilters, setShowFilters] = useState(false);

  // Si hay un filtro activo distinto de 'all', mantener visible
  const shouldRenderChips = showFilters || activeFilter !== 'all';

  return (
    <div className="client-search-section reveal-on-scroll">
      {/* Input de Búsqueda con Botón Sutil Integrado */}
      <div className="search-input-wrapper">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar plato, ingrediente (ej. queso, smash, malteada)..."
          className="search-input"
          aria-label="Buscar platos"
        />

        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="search-clear-btn"
            title="Limpiar búsqueda"
          >
            <X size={16} />
          </button>
        )}

        {/* Botón de solo icono para ocultar / mostrar filtros */}
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`search-filter-toggle-btn ${shouldRenderChips ? 'active' : ''}`}
          aria-label="Filtros"
          title={shouldRenderChips ? 'Ocultar filtros' : 'Mostrar filtros'}
        >
          <SlidersHorizontal size={16} />
        </button>
      </div>

      {/* Chips de Filtro Rápido (Se muestran únicamente cuando se activa el botón sutil) */}
      {shouldRenderChips && (
        <div className="filter-chips-container">
          <button
            type="button"
            onClick={() => onFilterChange('all')}
            className={`filter-chip ${activeFilter === 'all' ? 'active' : ''}`}
          >
            <SlidersHorizontal size={13} />
            <span>Todos</span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange(activeFilter === 'featured' ? 'all' : 'featured')}
            className={`filter-chip ${activeFilter === 'featured' ? 'active featured' : ''}`}
          >
            <Star size={13} fill={activeFilter === 'featured' ? 'currentColor' : 'none'} />
            <span>Destacados</span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange(activeFilter === 'bestseller' ? 'all' : 'bestseller')}
            className={`filter-chip ${activeFilter === 'bestseller' ? 'active bestseller' : ''}`}
          >
            <Flame size={13} />
            <span>Más Vendidos</span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange(activeFilter === 'available' ? 'all' : 'available')}
            className={`filter-chip ${activeFilter === 'available' ? 'active available' : ''}`}
          >
            <CheckCircle size={13} />
            <span>Solo Disponibles</span>
          </button>
        </div>
      )}

      {/* Barra de estado cuando hay búsqueda o filtro activo */}
      {isFiltered && (
        <div className="filter-status-bar">
          <span className="filter-status-text">
            {resultsCount !== undefined && (
              <>
                <strong>{resultsCount}</strong> {resultsCount === 1 ? 'plato encontrado' : 'platos encontrados'}
              </>
            )}
            {searchTerm && ` para "${searchTerm}"`}
          </span>
          <button
            type="button"
            onClick={onClearAll}
            className="filter-reset-link"
          >
            Restablecer filtros
          </button>
        </div>
      )}
    </div>
  );
};
