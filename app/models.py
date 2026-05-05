from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class YourModelName(db.Model):
    __tablename__ = 'your_model_name'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f'<YourModelName {self.name}>'