from datetime import datetime as dt

class Task:
    def __init__(self, id, name, is_completed, reward):
        self.id = id
        self.name = name
        self.is_completed = is_completed
        self.reward = reward

