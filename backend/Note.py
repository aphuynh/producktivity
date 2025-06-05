class Note:
    def __init__(self, id, name, body, date_created, date_modified):
        self.id = id
        self.name = name
        self.body = body
        self.date_created = date_created
        self.date_modified = date_modified

class NoteInfo:
    def __init__(self, id, name, date_created, date_modified):
        self.id = id
        self.name = name
        self.date_created = date_created
        self.date_modified = date_modified