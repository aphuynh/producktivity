class Task:
    def __init__(self, id, name, description, is_completed, reward, priority, due_date, start_date, complete_date, type, parent_id):
        self.id = id
        self.name = name
        self.description = description
        self.is_completed = is_completed
        self.reward = reward
        self.priority = priority
        self.due_date = due_date
        self.start_date = start_date
        self.complete_date = complete_date
        self.type = type
        self.subtasks = []
        self.lists = []
        self.parent_id = parent_id

    def print_info(self, indents):
        print(indents * "\t" + self.name)

    def print_tasks(self):
        self.print_tasks_r(self, 0)

    def print_tasks_r(self, task, depth):
        task.print_info(depth)
        for subtask in task.subtasks:
            self.print_tasks_r(subtask, depth + 1)