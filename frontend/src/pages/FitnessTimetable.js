import React, { useState, useEffect } from 'react';
import { getFitnessEntry, saveFitnessEntry } from '../api';
import { toDateStr, getMonday, getWeekDates, getDayName, formatDisplay } from '../dateUtils';

const EMPTY_ENTRY = { planned: '', actual: '', notes: '' };

function DayCard({ date, today }) {
  const dateStr = toDateStr(date);
  const [entry, setEntry] = useState(EMPTY_ENTRY);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getFitnessEntry(dateStr)
      .then(data => {
        setEntry({ planned: data.planned || '', actual: data.actual || '', notes: data.notes || '' });
        setDirty(false);
      })
      .catch(() => setEntry(EMPTY_ENTRY))
      .finally(() => setLoading(false));
  }, [dateStr]);

  const handleChange = (field, value) => {
    setEntry(prev => ({ ...prev, [field]: value }));
    setDirty(true);
    setSaved(false);
  };

  const handleSave = () => {
    saveFitnessEntry(dateStr, entry)
      .then(() => {
        setSaved(true);
        setDirty(false);
        setTimeout(() => setSaved(false), 3000);
      })
      .catch(() => alert('Failed to save. Please check the server is running.'));
  };

  return (
    <div className={`day-card${today ? ' today' : ''}`}>
      <div className="day-label">
        <span className="day-name">{getDayName(date)}</span>
        <span className="day-date">{formatDisplay(dateStr)}</span>
      </div>

      <div className="field-group">
        <label className="field-label planned">Planned</label>
        <textarea
          rows={3}
          placeholder="What do you plan to do today?"
          value={loading ? '' : entry.planned}
          disabled={loading}
          onChange={e => handleChange('planned', e.target.value)}
        />
      </div>

      <div className="field-group">
        <label className="field-label actual">Actual</label>
        <textarea
          rows={3}
          placeholder="What did you actually do?"
          value={loading ? '' : entry.actual}
          disabled={loading}
          onChange={e => handleChange('actual', e.target.value)}
        />
      </div>

      <div className="field-group">
        <label className="field-label notes">Notes</label>
        <textarea
          rows={2}
          placeholder="Any notes or comments…"
          value={loading ? '' : entry.notes}
          disabled={loading}
          onChange={e => handleChange('notes', e.target.value)}
        />
      </div>

      <div className="save-btn-row">
        {saved && <span className="saved-indicator">✓ Saved</span>}
        <button
          className="btn btn-primary btn-sm"
          onClick={handleSave}
          disabled={!dirty || loading}
        >
          Save
        </button>
      </div>
    </div>
  );
}

function FitnessTimetable() {
  const [monday, setMonday] = useState(() => getMonday(new Date()));
  const todayStr = toDateStr(new Date());
  const weekDates = getWeekDates(monday);

  const prevWeek = () => {
    const d = new Date(monday);
    d.setDate(d.getDate() - 7);
    setMonday(d);
  };

  const nextWeek = () => {
    const d = new Date(monday);
    d.setDate(d.getDate() + 7);
    setMonday(d);
  };

  const goToday = () => setMonday(getMonday(new Date()));

  const weekLabel = `${formatDisplay(toDateStr(weekDates[0]))} – ${formatDisplay(toDateStr(weekDates[6]))}`;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🏋️ Fitness Timetable</h1>
        <div className="week-nav">
          <button className="btn btn-secondary btn-sm" onClick={prevWeek}>‹ Prev</button>
          <span>{weekLabel}</span>
          <button className="btn btn-secondary btn-sm" onClick={nextWeek}>Next ›</button>
          <button className="btn btn-primary btn-sm" onClick={goToday}>Today</button>
        </div>
      </div>

      <div className="week-grid">
        {weekDates.map(date => (
          <DayCard
            key={toDateStr(date)}
            date={date}
            today={toDateStr(date) === todayStr}
          />
        ))}
      </div>
    </div>
  );
}

export default FitnessTimetable;
