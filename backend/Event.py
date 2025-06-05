class Event:
    def __init__(
            self, 
            id,
            group_id,
            event_type_id, 
            title, 
            all_day,
            start,
            end,
            rrule,
            url,
            editable,
            extended_props
    ):
        self.id = id
        self.group_id = group_id
        self.event_type_id = event_type_id
        self.title = title
        self.all_day = all_day
        self.start = start
        self.end = end
        self.rrule = rrule
        self.url = url
        self.editable = editable
        self.extended_props = extended_props