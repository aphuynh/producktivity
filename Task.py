from datetime import datetime as dt

class Task:
    def __init__(self, id, name, is_completed, reward, start_date, due_date, type):
        self.id = id
        self.name = name
        self.is_completed = is_completed
        self.reward = reward
        self.start_date = start_date
        self.due_date = due_date
        self.type = type

