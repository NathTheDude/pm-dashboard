import React, { useState, useEffect, useCallback } from 'react';
import { getFoodLog, saveFoodLog, getAllFoodLogs, deleteFoodLog } from '../api';
import { toDateStr, formatDisplay } from '../dateUtils';

const EMPTY_LOG = { meals: '', highlights: '', struggles: '' };

function FoodLog() {
  const [selectedDate, setSelectedDate] = useState(() => toDateStr(new Date()));
  const [log, setLog] = useState(EMPTY_LOG);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  const fetchLog = useCallback((date) => {
    setLoading(true);
    getFoodLog(date)
      .then(data => {
        setLog({ meals: data.meals || '', highlights: data.highlights || '', struggles: data.struggles || '' });
        setDirty(false);
      })
      .catch(() => setLog(EMPTY_LOG))
      .finally(() => setLoading(false));
  }, []);

  const fetchHistory = useCallback(() => {
    getAllFoodLogs()
      .then(setHistory)
      .catch(() => console.error('Failed to load food log history'));
  }, []);

  useEffect(() => {
    fetchLog(selectedDate);
  }, [selectedDate, fetchLog]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleChange = (field, value) => {
    setLog(prev => ({ ...prev, [field]: value }));
    setDirty(true);
    setSaved(false);
  };

  const handleSave = () => {
    saveFoodLog(selectedDate, log)
      .then(() => {
        setSaved(true);
        setDirty(false);
        setTimeout(() => setSaved(false), 3000);
        fetchHistory();
      })
      .catch(() => alert('Failed to save. Please check the server is running.'));
  };

  const handleDelete = async (date, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete food log for ${formatDisplay(date)}?`)) return;
    try {
      await deleteFoodLog(date);
      fetchHistory();
      if (date === selectedDate) {
        setLog(EMPTY_LOG);
        setDirty(false);
      }
    } catch {
      alert('Failed to delete entry. Please check the server is running.');
    }
  };

  const changeDate = (delta) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    setSelectedDate(toDateStr(d));
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🥗 Food Log</h1>
        <div className="date-nav">
          <button className="btn btn-secondary btn-sm" onClick={() => changeDate(-1)}>‹ Prev</button>
          <span>{formatDisplay(selectedDate)}</span>
          <button className="btn btn-secondary btn-sm" onClick={() => changeDate(1)}>Next ›</button>
          <button className="btn btn-primary btn-sm" onClick={() => setSelectedDate(toDateStr(new Date()))}>
            Today
          </button>
        </div>
      </div>

      <div className="food-log-card">
        <div className="field-group">
          <label className="field-label meals">What I ate today</label>
          <textarea
            rows={5}
            placeholder="Breakfast, lunch, dinner, snacks…"
            value={loading ? '' : log.meals}
            disabled={loading}
            onChange={e => handleChange('meals', e.target.value)}
          />
        </div>

        <div className="field-group">
          <label className="field-label highlights">Highlights 🌟</label>
          <textarea
            rows={3}
            placeholder="What went well? Good choices, new recipes…"
            value={loading ? '' : log.highlights}
            disabled={loading}
            onChange={e => handleChange('highlights', e.target.value)}
          />
        </div>

        <div className="field-group">
          <label className="field-label struggles">Struggles 😓</label>
          <textarea
            rows={3}
            placeholder="Any difficulties, cravings, slip-ups…"
            value={loading ? '' : log.struggles}
            disabled={loading}
            onChange={e => handleChange('struggles', e.target.value)}
          />
        </div>

        <div className="save-btn-row">
          {saved && <span className="saved-indicator">✓ Saved</span>}
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={!dirty || loading}
          >
            Save
          </button>
        </div>
      </div>

      {history.length > 0 && (
        <>
          <h2 className="section-title">Previous Entries</h2>
          <div className="history-list">
            {history.map(item => (
              <div
                key={item.log_date}
                className="history-item"
                onClick={() => setSelectedDate(item.log_date)}
              >
                <span className="date">{formatDisplay(item.log_date)}</span>
                <span className="preview">
                  {item.meals ? item.meals.substring(0, 80) + (item.meals.length > 80 ? '…' : '') : 'No meals recorded'}
                </span>
                <div className="actions">
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={(e) => handleDelete(item.log_date, e)}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default FoodLog;
