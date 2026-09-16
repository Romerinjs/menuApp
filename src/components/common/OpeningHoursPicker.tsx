import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Check, Plus, Trash2 } from 'lucide-react';

interface OpeningHoursPickerProps {
  value?: string;
  onChange: (formattedHours: string) => void;
}

const DAYS_OF_WEEK = [
  { key: 'Lun', label: 'Lunes' },
  { key: 'Mar', label: 'Martes' },
  { key: 'Mié', label: 'Miércoles' },
  { key: 'Jue', label: 'Jueves' },
  { key: 'Vie', label: 'Viernes' },
  { key: 'Sáb', label: 'Sábado' },
  { key: 'Dom', label: 'Domingo' }
];

const TIME_OPTIONS = [
  '06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM',
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM',
  '09:00 PM', '09:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM',
  '12:00 AM', '01:00 AM', '02:00 AM', '03:00 AM'
];

type PresetMode = 'everyday' | 'mon_sat' | 'mon_fri' | 'custom';

export const OpeningHoursPicker: React.FC<OpeningHoursPickerProps> = ({
  value = '',
  onChange
}) => {
  // Parsing inicial básico
  const [preset, setPreset] = useState<PresetMode>('everyday');
  const [startDay, setStartDay] = useState('Lun');
  const [endDay, setEndDay] = useState('Dom');
  const [openTime, setOpenTime] = useState('11:30 AM');
  const [closeTime, setCloseTime] = useState('10:30 PM');

  // Segundo horario opcional (ej: Fines de semana)
  const [hasWeekendShift, setHasWeekendShift] = useState(false);
  const [weekendOpenTime, setWeekendOpenTime] = useState('12:00 PM');
  const [weekendCloseTime, setWeekendCloseTime] = useState('11:00 PM');

  // Inicializar estado a partir del string si existe
  useEffect(() => {
    if (!value) return;
    if (value.includes('Lun a Dom') || value.includes('Lun - Dom') || value.includes('Lunes a Domingo')) {
      setPreset('everyday');
    } else if (value.includes('Lun a Sáb') || value.includes('Lun - Sab') || value.includes('Lunes a Sábado')) {
      setPreset('mon_sat');
    } else if (value.includes('Lun a Vie') || value.includes('Lun - Vie') || value.includes('Lunes a Viernes')) {
      setPreset('mon_fri');
    }
  }, []);

  // Construir el string formateado y emitirlo
  useEffect(() => {
    let dayRange = 'Lun a Dom';
    if (preset === 'mon_sat') dayRange = 'Lun a Sáb';
    else if (preset === 'mon_fri') dayRange = 'Lun a Vie';
    else if (preset === 'custom') dayRange = `${startDay} a ${endDay}`;

    let result = `${dayRange}: ${openTime} - ${closeTime}`;

    if (hasWeekendShift && preset === 'mon_fri') {
      result += ` | Sáb y Dom: ${weekendOpenTime} - ${weekendCloseTime}`;
    }

    onChange(result);
  }, [preset, startDay, endDay, openTime, closeTime, hasWeekendShift, weekendOpenTime, weekendCloseTime]);

  return (
    <div
      style={{
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
          <Clock size={15} color="var(--primary)" /> Horario de Atención
        </label>
        <span
          style={{
            fontSize: '0.78rem',
            color: 'var(--primary)',
            fontWeight: 600,
            background: 'rgba(255, 87, 34, 0.1)',
            padding: '0.2rem 0.6rem',
            borderRadius: '999px'
          }}
        >
          {preset === 'everyday' && 'Lunes a Domingo'}
          {preset === 'mon_sat' && 'Lunes a Sábado'}
          {preset === 'mon_fri' && (hasWeekendShift ? 'Lun-Vie + Fin de Semana' : 'Lunes a Viernes')}
          {preset === 'custom' && `${startDay} a ${endDay}`}
        </span>
      </div>

      {/* Selector de Días Preconfigurados */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.4rem' }}>
        {[
          { key: 'everyday' as PresetMode, label: 'Lun a Dom' },
          { key: 'mon_sat' as PresetMode, label: 'Lun a Sáb' },
          { key: 'mon_fri' as PresetMode, label: 'Lun a Vie' },
          { key: 'custom' as PresetMode, label: 'Personalizado' }
        ].map((item) => {
          const isSelected = preset === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setPreset(item.key);
                if (item.key !== 'mon_fri') setHasWeekendShift(false);
              }}
              style={{
                padding: '0.45rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                background: isSelected ? 'rgba(255, 87, 34, 0.15)' : 'var(--bg-surface)',
                color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                transition: 'all 0.15s ease'
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Selectores Personalizados de Días si preset === 'custom' */}
      {preset === 'custom' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', background: 'var(--bg-surface)', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
          <div>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Día Inicial</label>
            <select
              value={startDay}
              onChange={(e) => setStartDay(e.target.value)}
              className="form-select"
              style={{ fontSize: '0.82rem', padding: '0.35rem 0.5rem' }}
            >
              {DAYS_OF_WEEK.map((d) => (
                <option key={d.key} value={d.key}>{d.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Día Final</label>
            <select
              value={endDay}
              onChange={(e) => setEndDay(e.target.value)}
              className="form-select"
              style={{ fontSize: '0.82rem', padding: '0.35rem 0.5rem' }}
            >
              {DAYS_OF_WEEK.map((d) => (
                <option key={d.key} value={d.key}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Selectores de Horas (Apertura y Cierre) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', alignItems: 'center' }}>
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
            Abre a las
          </label>
          <select
            value={openTime}
            onChange={(e) => setOpenTime(e.target.value)}
            className="form-select"
            style={{ fontSize: '0.85rem', padding: '0.45rem 0.6rem' }}
          >
            {TIME_OPTIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
            Cierra a las
          </label>
          <select
            value={closeTime}
            onChange={(e) => setCloseTime(e.target.value)}
            className="form-select"
            style={{ fontSize: '0.85rem', padding: '0.45rem 0.6rem' }}
          >
            {TIME_OPTIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Opción para fin de semana si el preset es Lun a Vie */}
      {preset === 'mon_fri' && (
        <div style={{ borderTop: '1px dashed var(--border-subtle)', paddingTop: '0.75rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              checked={hasWeekendShift}
              onChange={(e) => setHasWeekendShift(e.target.checked)}
              style={{ accentColor: 'var(--primary)' }}
            />
            <span>Añadir horario diferenciado para Sábado y Domingo</span>
          </label>

          {hasWeekendShift && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginTop: '0.5rem', background: 'var(--bg-surface)', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Sáb y Dom Abre</label>
                <select
                  value={weekendOpenTime}
                  onChange={(e) => setWeekendOpenTime(e.target.value)}
                  className="form-select"
                  style={{ fontSize: '0.8rem', padding: '0.35rem' }}
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={`we-open-${t}`} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Sáb y Dom Cierra</label>
                <select
                  value={weekendCloseTime}
                  onChange={(e) => setWeekendCloseTime(e.target.value)}
                  className="form-select"
                  style={{ fontSize: '0.8rem', padding: '0.35rem' }}
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={`we-close-${t}`} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
