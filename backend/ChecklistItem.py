class ChecklistItem:
    def __init__(self, id, checklist_id, description, is_complete):
        self.id = id
        self.checklist_id = checklist_id
        self.description = description
        self.is_complete = is_complete