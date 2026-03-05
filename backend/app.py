from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# SQLite database stored next to this file
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'dashboard.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


# ──────────────────────────────────────────────
# Models
# ──────────────────────────────────────────────

class FitnessEntry(db.Model):
    """One row per day in the fitness timetable."""
    id = db.Column(db.Integer, primary_key=True)
    entry_date = db.Column(db.String(10), nullable=False, unique=True)  # YYYY-MM-DD
    planned = db.Column(db.Text, nullable=False, default='')
    actual = db.Column(db.Text, nullable=False, default='')
    notes = db.Column(db.Text, nullable=False, default='')

    def to_dict(self):
        return {
            'id': self.id,
            'entry_date': self.entry_date,
            'planned': self.planned,
            'actual': self.actual,
            'notes': self.notes,
        }


class FoodLog(db.Model):
    """One row per day in the food / nutrition log."""
    id = db.Column(db.Integer, primary_key=True)
    log_date = db.Column(db.String(10), nullable=False, unique=True)   # YYYY-MM-DD
    meals = db.Column(db.Text, nullable=False, default='')
    highlights = db.Column(db.Text, nullable=False, default='')
    struggles = db.Column(db.Text, nullable=False, default='')

    def to_dict(self):
        return {
            'id': self.id,
            'log_date': self.log_date,
            'meals': self.meals,
            'highlights': self.highlights,
            'struggles': self.struggles,
        }


# ──────────────────────────────────────────────
# Fitness timetable routes
# ──────────────────────────────────────────────

@app.route('/api/fitness', methods=['GET'])
def get_fitness_entries():
    """Return all fitness entries, ordered by date."""
    entries = FitnessEntry.query.order_by(FitnessEntry.entry_date).all()
    return jsonify([e.to_dict() for e in entries])


@app.route('/api/fitness/<string:entry_date>', methods=['GET'])
def get_fitness_entry(entry_date):
    """Return a single fitness entry for the given date (YYYY-MM-DD)."""
    entry = FitnessEntry.query.filter_by(entry_date=entry_date).first()
    if entry is None:
        return jsonify({'entry_date': entry_date, 'planned': '', 'actual': '', 'notes': ''})
    return jsonify(entry.to_dict())


@app.route('/api/fitness/<string:entry_date>', methods=['PUT'])
def upsert_fitness_entry(entry_date):
    """Create or update a fitness entry for the given date."""
    data = request.get_json(silent=True) or {}
    entry = FitnessEntry.query.filter_by(entry_date=entry_date).first()
    if entry is None:
        entry = FitnessEntry(entry_date=entry_date)
        db.session.add(entry)
    entry.planned = data.get('planned', entry.planned)
    entry.actual = data.get('actual', entry.actual)
    entry.notes = data.get('notes', entry.notes)
    db.session.commit()
    return jsonify(entry.to_dict()), 200


@app.route('/api/fitness/<string:entry_date>', methods=['DELETE'])
def delete_fitness_entry(entry_date):
    """Delete a fitness entry."""
    entry = FitnessEntry.query.filter_by(entry_date=entry_date).first()
    if entry:
        db.session.delete(entry)
        db.session.commit()
    return jsonify({'deleted': entry_date}), 200


# ──────────────────────────────────────────────
# Food log routes
# ──────────────────────────────────────────────

@app.route('/api/food', methods=['GET'])
def get_food_logs():
    """Return all food log entries, ordered by date descending."""
    logs = FoodLog.query.order_by(FoodLog.log_date.desc()).all()
    return jsonify([l.to_dict() for l in logs])


@app.route('/api/food/<string:log_date>', methods=['GET'])
def get_food_log(log_date):
    """Return a single food log entry for the given date (YYYY-MM-DD)."""
    log = FoodLog.query.filter_by(log_date=log_date).first()
    if log is None:
        return jsonify({'log_date': log_date, 'meals': '', 'highlights': '', 'struggles': ''})
    return jsonify(log.to_dict())


@app.route('/api/food/<string:log_date>', methods=['PUT'])
def upsert_food_log(log_date):
    """Create or update a food log entry for the given date."""
    data = request.get_json(silent=True) or {}
    log = FoodLog.query.filter_by(log_date=log_date).first()
    if log is None:
        log = FoodLog(log_date=log_date)
        db.session.add(log)
    log.meals = data.get('meals', log.meals)
    log.highlights = data.get('highlights', log.highlights)
    log.struggles = data.get('struggles', log.struggles)
    db.session.commit()
    return jsonify(log.to_dict()), 200


@app.route('/api/food/<string:log_date>', methods=['DELETE'])
def delete_food_log(log_date):
    """Delete a food log entry."""
    log = FoodLog.query.filter_by(log_date=log_date).first()
    if log:
        db.session.delete(log)
        db.session.commit()
    return jsonify({'deleted': log_date}), 200


# ──────────────────────────────────────────────
# Startup
# ──────────────────────────────────────────────

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=False)
