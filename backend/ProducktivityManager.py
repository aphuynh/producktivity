import sqlite3
import threading
import datetime
from Task import Task
from List import List
from Checklist import Checklist
from ChecklistItem import ChecklistItem
from Habit import Habit
from Note import Note, NoteInfo
from Tag import Tag
from Event import Event
from EventType import EventType
from EventGroup import EventGroup
import json

class ProducktivityManager:

#--------- INITIALIZATION -----------

    def __init__(self):
        self.db = sqlite3.connect("producktivity.db", check_same_thread=False)
        self.db.execute("PRAGMA foreign_keys = 1")
        self.cursor = self.db.cursor()
        self.lock = threading.Lock()
        self.reset = False

        self.initialize_database()

    def initialize_database(self): #break down later if necessary

        #check if database is empty

        table_count_query =  "SELECT COUNT(*) FROM sqlite_schema"
        tables = 0

        try:
            self.lock.acquire(True)
            self.cursor.execute(table_count_query)
            tables = int(self.cursor.fetchone()[0])
        except Exception as e:
            print(e)
        finally:
            self.lock.release()


        if self.reset or tables == 0:
            #create user_info table
            print("user_info not found, creating table... ")

            create_user_info_commands = [
                "CREATE TABLE IF NOT EXISTS user_info(key TEXT PRIMARY KEY, value TEXT)",
                "INSERT OR IGNORE INTO user_info VALUES ('username', 'Jellycat')",
                "INSERT OR IGNORE INTO user_info VALUES ('wallet', 0)",
                "INSERT OR IGNORE INTO user_info VALUES ('experience', 0)"
            ]

            for command in create_user_info_commands:
                self.modify_db_query(command)

            create_settings_command = [
                "CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value BOOLEAN);",
                "INSERT OR IGNORE INTO settings VALUES ('show_tasks_on_calendar', 'true')"
            ]
            for command in create_settings_command:
                self.modify_db_query(command)

            create_task_command = """CREATE TABLE IF NOT EXISTS task(
                                   id INTEGER PRIMARY KEY,
                                   name TEXT NOT NULL, 
                                   description TEXT,  
                                   is_completed BOOLEAN, 
                                   reward INTEGER NOT NULL, 
                                   priority INTEGER NOT NULL, 
                                   due_date DATETIME, 
                                   start_date DATETIME, 
                                   complete_date DATETIME, 
                                   type TEXT,
                                   parent_id INTEGER)"""
            
            create_list_command = "CREATE TABLE IF NOT EXISTS list (id INTEGER PRIMARY KEY, name TEXT UNIQUE NOT NULL)"

            create_task_list_command = """CREATE TABLE IF NOT EXISTS task_list(
                                        task_id INTEGER, 
                                        list_id INTEGER, 
                                        PRIMARY KEY (task_id, list_id), 
                                        FOREIGN KEY (task_id) REFERENCES task(id) ON DELETE CASCADE ON UPDATE CASCADE, 
                                        FOREIGN KEY (list_id) REFERENCES list(id) ON DELETE CASCADE ON UPDATE CASCADE)"""
            
            create_checklist_command = "CREATE TABLE IF NOT EXISTS checklist (id INTEGER PRIMARY KEY, name TEXT UNIQUE NOT NULL);"
            create_checklist_item_command = """CREATE TABLE IF NOT EXISTS checklist_item (
                                                    id INTEGER PRIMARY KEY, 
                                                    checklist_id INTEGER, 
                                                    name TEXT NOT NULL, 
                                                    description TEXT, 
                                                    is_complete BOOLEAN);"""

            create_habit_command = """CREATE TABLE IF NOT EXISTS habit(
                                        id INTEGER PRIMARY KEY,
                                        name TEXT NOT NULL,
                                        reward INTEGER NOT NULL,
                                        times_completed INTEGER NOT NULL,
                                        times_needed INTEGER NOT NULL,
                                        img TEXT,
                                        frequency TEXT NOT NULL);"""
            
            create_note_command = """CREATE TABLE IF NOT EXISTS note(
                                        id INTEGER PRIMARY KEY,
                                        name TEXT NOT NULL,
                                        body TEXT,
                                        date_created DATETIME NOT NULL,
                                        date_modified DATETIME NOT NULL
                                    );"""
            
            create_tag_command = """CREATE TABLE IF NOT EXISTS tag(
                                        id INTEGER PRIMARY KEY,
                                        name TEXT UNIQUE NOT NULL
                                    );"""
            
            create_note_tag_command = """CREATE TABLE IF NOT EXISTS note_tag(
                                            note_id INTEGER,
                                            tag_id INTEGER,
                                            PRIMARY KEY (note_id, tag_id),
                                            FOREIGN KEY (note_id) REFERENCES note(id) ON DELETE CASCADE ON UPDATE CASCADE,
                                            FOREIGN KEY (tag_id) REFERENCES tag(id) ON DELETE CASCADE ON UPDATE CASCADE
                                        );	"""
            
            create_calendar_event_type_commands = ["CREATE TABLE IF NOT EXISTS calendar_event_type(id INTEGER PRIMARY KEY, name TEXT, color TEXT, background_color TEXT)",
                                          "INSERT OR IGNORE INTO calendar_event_type(name, color, background_color) VALUES ('Birthday', '#ffaddd', '#ffffff')",
                                          "INSERT OR IGNORE INTO calendar_event_type(name, color, background_color) VALUES ('Task', '#2977ff', '#ffffff')",
                                          "INSERT OR IGNORE INTO calendar_event_type(name, color, background_color) VALUES ('Holiday', '#c37aff', '#ffffff')",
                                          "INSERT OR IGNORE INTO calendar_event_type(name, color, background_color) VALUES ('Meeting', '#eb3434', '#ffffff')",
                                          "INSERT OR IGNORE INTO calendar_event_type(name, color, background_color) VALUES ('Event', '#82cc62', '#ffffff')",
                                          ]

            create_calendar_event_group_command = """
                CREATE TABLE IF NOT EXISTS calendar_event_group(
                    id INTEGER PRIMARY KEY,
                    name TEXT NOT NULL UNIQUE
                );
            """
            
            create_calendar_event_command = """
                CREATE TABLE IF NOT EXISTS calendar_event(
                    id INTEGER PRIMARY KEY,
                    group_id INTEGER,
                    title TEXT NOT NULL,
                    all_day BOOLEAN,
                    start INTEGER,
                    end INTEGER,
                    rrule TEXT,
                    url TEXT,
                    editable BOOLEAN,
                    extended_props TEXT,
                    FOREIGN KEY (group_id) REFERENCES calendar_event_group(id) ON DELETE CASCADE ON UPDATE CASCADE,
                    FOREIGN KEY (event_type_id) REFERENCES calendar_event_type(id) ON DELETE CASCADE ON UPDATE CASCADE
                );
            """
            

            self.modify_db_query(create_task_command)
            self.modify_db_query(create_list_command)
            self.modify_db_query(create_task_list_command)

            self.modify_db_query(create_checklist_command)
            self.modify_db_query(create_checklist_item_command)

            self.modify_db_query(create_habit_command)    

            self.modify_db_query(create_note_command)
            self.modify_db_query(create_tag_command)
            self.modify_db_query(create_note_tag_command)   
    
            self.modify_db_query(create_calendar_event_group_command)
            self.modify_db_query(create_calendar_event_command)

# --------- TESTING -----------

    def insert_test_tasks(self):
        insert_tasks_query = """INSERT OR IGNORE INTO task(name, description, is_completed, reward, priority, due_date, start_date, complete_date, type, parent_id) 
                        VALUES (?,?,?,?,?,?,?,?,?, ?)"""
        
        desc = "Lorem ipsum dolor sit amet consectetur. Arcu mattis pellentesque vitae at varius dis lorem. Faucibus eu mollis eget tellus ultricies. Proin phasellus sed sapien dui ut quam morbi. Ac suspendisse consectetur quis adipiscing et eget ut. \n Urna est massa ut nunc magna. Proin sed odio suspendisse duis. Varius mauris tellus adipiscing nulla aliquet vulputate enim. Malesuada dolor sollicitudin amet sed sociis vestibulum risus mauris. Vulputate posuere lectus nunc nunc amet egestas eu. Tempor mattis tortor ut turpis blandit non semper. Sagittis porta sagittis feugiat ut luctus sit. Orci vel."
        now = datetime.datetime.now()
        
        task_params = [("Main Task", desc, False, 3, 3, now, now, now, "normal", None),
                  ("Subtask 1", desc, False, 3, 3, now, now, now, "normal", 1),
                  ("sub-Subtask 1", desc, False, 3, 3, now, now, now, "normal", 2),
                  ("sub-Subtask 2", desc, False, 3, 3, now, now, now, "normal", 2),
                  ("Subtask 2", desc, False, 3, 3, now, now, now, "normal", 1),
                  ("sub-Subtask 3", desc, False, 3, 3, now, now, now, "normal", 5),
                  ("sub-sub-Subtask 1", desc, False, 3, 3, now, now, now, "normal", 6),
                  ("Main Task 2", desc, False, 3, 3, now, now, now, "normal", None),
                  ("Subtask 3", desc, False, 3, 3, now, now, now, "normal", 8)]
        
        for param in task_params:
            self.modify_db_query(insert_tasks_query, param)


    def insert_test_habits(self):
        insert_habits_query = """INSERT OR IGNORE INTO habit(name, reward, times_completed, times_needed, img, frequency) 
                        VALUES (?,?,?,?,?,?)"""
                
        habit_params = [("Drink Water", 2, 0, 6, "", "daily"),
                  ("Crochet a Project", 5, 0, 1, "", "weekly"),
                  ("Leetcode", 3, 0, 4, "", "daily"),
                  ("Tennis", 5, 0, 1, "", "weekly"),
                  ("Job Applications", 4, 0, 5, "", "daily"),
                  ("Eat", 2, 0, 3, "", "daily"),
                  ("Shower", 2, 0, 1, "", "daily"),
                  ("Maple Dailies", 1, 0, 3, "", "daily"),
                  ("Genshin Dailies", 1, 0, 2, "", "daily")]
        
        for param in habit_params:
            self.modify_db_query(insert_habits_query, param)

    def insert_test_notes(self):
        insert_notes_query = """INSERT OR IGNORE INTO note(name, body, date_created, date_modified) 
                        VALUES (?,?,?,?)"""
        now = datetime.datetime.now()        
        
        notes_params = [("Raccoon Crochet Pattern", "", now, now),
                  ("Periodic Table of Elements Lyrics", "", now, now),
                  ("Journal Entry #1", "", now, now),
                  ("CS123 Notes", "", now, now),
                  ("Git Commands", "", now, now),
                  ("Tepetlisaur Crochet PAttern - IP", "", now, now),
                  ("Minecraft Server Set Up", "", now, now)]
        
        for param in notes_params:
            self.modify_db_query(insert_notes_query, param)

    def insert_test_events(self):
        insert_event_group_query = """INSERT OR IGNORE INTO calendar_event_group(name) VALUES ("Group1")"""
        self.modify_db_query(insert_event_group_query)

        insert_events_query = """
            INSERT OR IGNORE INTO calendar_event(
                group_id,
                title,
                all_day,
                start,
                end,
                rrule,
                url,
                editable,
                extended_props
            ) 
            VALUES (?,?,?,?,?,?,?,?,?)"""      
        
        notes_params = [
            (None, "Boop's BDAY :)", True, None, None, json.dumps({'freq': 'yearly', 'dtstart':'2001-01-20','until': '2999-01-20'}), None, True, None),
            (None, "All Day Event", None, 1740787200000, None, None, None, True, None),
            (None, "Long Event", None, 1741305600000, 1741564800000, None, None, True, None),
            (1, "Grouped Event", None, 1741561200000, None, None, None, True, None),
            (1, "Grouped Event", None, 1742166000000, None, None, None, True, None),
            (None, "Conference", None, 1741651200000, 1741824000000, None, None, True, None),
            (None, "Meeting", None, 1741800600000, 1741807800000, None, None, True, None),
            (None, "Lunch", None, 1741806000000, None, None, None, True, None),
            (None, "Meeting", None, 1741815000000, None, None, None, True, None),
            (None, "Happy Hour", None, 1741825800000, None, None, None, True, None),
            (None, "Dinner", None, 1741834800000, None, None, None, True, None),
            (None, "Birthday Party", None, 1741874400000, None, None, None, True, None),
            (None, "Click for Google", None, 1743120000000, None, None, "http://google.com/", True, None),
        ]
        
        for param in notes_params:
            self.modify_db_query(insert_events_query, param)


# --------- GENERAL -----------

    def get_last_row_id(self):
        id = -1
        try:
            self.lock.acquire(True)
            id = self.cursor.lastrowid
        except Exception as e:
            print(e)
            id = -1
        finally:
            self.lock.release()
        return id

    def modify_db_query(self, query, params=()):
        row_count = -1

        try:
            self.lock.acquire(True)
            self.cursor.execute(query, params)
            row_count = self.cursor.rowcount
            self.db.commit()
        except Exception as e:
            print(e)
            row_count = -1
        finally:
            self.lock.release()

        return row_count

    def get_single_row_query(self, query, params=()):
        value = None

        try:
            self.lock.acquire(True)
            self.cursor.execute(query, params)
            value = self.cursor.fetchone()[0]
        except Exception as e:
            print(e)
        finally:
            self.lock.release()

        return value

    def get_mutiple_rows_query(self, query, params=()):
        items = []

        try:
            self.lock.acquire(True)
            self.cursor.execute(query, params)
            items = self.cursor.fetchall()
        except Exception as e:
            print(e)
        finally:
            self.lock.release()
        

        return items

    
# --------- TASK METHODS -----------

    def get_tasks_ordered(self):
        tasks = []

        #grab ids of 
        root_tasks = self.get_mutiple_rows_query("SELECT * FROM task WHERE parent_id is NULL")

        for root_task in root_tasks:
            tasks.append(Task(int(root_task[0]), root_task[1], root_task[2], bool(root_task[3]), int(root_task[4]), int(root_task[5]), root_task[6], root_task[7],root_task[8], root_task[9], root_task[10]))
            tasks[-1].lists = self.get_lists_associated_with_task(tasks[-1].id)

        for task in tasks:
            queue = [task]
            for subtask in self.get_subtasks(task.id):
                while len(queue) > 0:
                    if queue[0].id == subtask[10]:
                        temp_task = Task(subtask[0], subtask[1], subtask[2], subtask[3], subtask[4], subtask[5], subtask[6], subtask[7],subtask[8], subtask[9], subtask[10])
                        temp_task.lists = self.get_lists_associated_with_task(temp_task.id)
                        queue[0].subtasks.append(temp_task)
                        queue.append(temp_task)
                        break
                    else:
                        queue.pop(0)

        return tasks
    
    def get_tasks_all(self):
        task_map = {}

        query = "SELECT * FROM task"
        for task in self.get_mutiple_rows_query(query):
            task_map[int(task[0])] = Task(int(task[0]), task[1], task[2], bool(task[3]), int(task[4]), int(task[5]), task[6], task[7],task[8], task[9], task[10])
            task_map[int(task[0])].lists = self.get_lists_associated_with_task(task_map[int(task[0])].id)
        
        return task_map

    def get_subtasks(self, parent_id):
        query = """WITH RECURSIVE subtasks_cte (id, parent_id) AS (
                SELECT  id,
                        parent_id
                FROM    task
                WHERE   parent_id = ?
                UNION ALL
                SELECT  t.id,
                        t.parent_id
                FROM    task t
                INNER JOIN subtasks_cte
                        ON t.parent_id = subtasks_cte.id)
                SELECT b.* FROM subtasks_cte a
                LEFT JOIN task b
                    ON a.id = b.id"""
        
        return self.get_mutiple_rows_query(query, (parent_id,))

    def add_task(self, name, description, reward, priority, due_date=None, type="normal", parent_id=None):
        insert_query = ("INSERT INTO task (name, description, is_completed, reward, priority, due_date, start_date, type, parent_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
        result = self.modify_db_query(insert_query, (name, description, False, reward, priority, due_date, datetime.datetime.now(), type, parent_id))
        return self.get_last_row_id() if result else -1
    
    def edit_task(self, id, name, description, reward, priority, due_date=None, type="normal", parent_id=None):
        insert_query = ("UPDATE task SET name = ?, description = ?, reward = ?, priority = ?, due_date = ?, type = ?, parent_id = ? WHERE id = ?")
        return self.modify_db_query(insert_query, (name, description, reward, priority, due_date, type, parent_id, id))
    
    def apply_lists_to_task(self, taskid, lists):
        rows = 0
        
        delete_query = ("DELETE FROM task_list WHERE task_id = ?")
        self.modify_db_query(delete_query, (taskid,))

        insert_query = ("INSERT INTO task_list(task_id, list_id) VALUES (?, ?)")
        for list in lists:
            rows += self.modify_db_query(insert_query, (taskid, list))

        return 1 if rows > 0 else 0
    
    def get_username(self):
        select_query = "SELECT VALUE FROM user_info WHERE KEY = 'username'"
        return self.get_single_row_query(select_query)
    
    def get_wallet(self):
        select_query = "SELECT VALUE FROM user_info WHERE KEY = 'wallet'"
        return int(self.get_single_row_query(select_query))
    
    def update_wallet(self, transaction_amount):
        updated_balance = self.get_wallet() + transaction_amount
        update_query = "UPDATE user_info SET value = ? WHERE key = 'wallet'"
        return self.modify_db_query(update_query, (updated_balance,))

    def get_show_tasks_calendar(self):
        select_query = "SELECT VALUE FROM settings WHERE KEY = 'show_tasks_on_calendar'"
        return bool(self.get_single_row_query(select_query))

    def complete_task(self, task_id):
        complete_query = ("UPDATE task SET is_completed = true, complete_date = ? WHERE id = ?")
        return self.modify_db_query(complete_query, (datetime.datetime.now(), task_id))
    
    def undo_complete_task(self, task_id):
        complete_query = ("UPDATE task SET is_completed = false, complete_date = NULL WHERE id = ?")
        return self.modify_db_query(complete_query, (task_id,))
    
    def delete_task(self, task_id):
        delete_query = "DELETE FROM task WHERE id = ?"
        return self.modify_db_query(delete_query, (task_id,))
    
    def get_lists(self):
        lists = []
        select_query = "SELECT * FROM list"
        for list in self.get_mutiple_rows_query(select_query):
            lists.append(List(list[0], list[1]))
        return lists
    
    def add_list(self, name):
        insert_query = "INSERT INTO list (name) VALUES (?)"
        return self.modify_db_query(insert_query, (name, )), self.get_last_row_id()
    
    def remove_list(self, id):
        delete_query = "DELETE FROM list WHERE id = ?"
        return self.modify_db_query(delete_query, (id,))
    
    def rename_list(self, id, name):
        update_query = "UPDATE list SET name = ? WHERE id = ?"
        return self.modify_db_query(update_query, (name, id))
    
    def get_list_task_map(self):
        list_task_map = {}
        current_list_id = -1
        current_list_set = []
        select_query = "SELECT * FROM task_list ORDER BY list_id"

        for list in self.get_mutiple_rows_query(select_query):
            if current_list_id != list[1]:
                if current_list_id != -1:
                    list_task_map[current_list_id] = current_list_set
                    current_list_set = []
                current_list_id = list[1] 

            current_list_set.append(list[0])

        list_task_map[current_list_id] = current_list_set
        return list_task_map
    
    def get_lists_associated_with_task(self, taskid):
        lists = []
        select_query = "SELECT list_id FROM task_list WHERE task_id = ? ORDER BY list_id"
        for list_id in self.get_mutiple_rows_query(select_query, (taskid, )):
            lists.append(list_id[0])

        return lists


#--------- CHECKLIST METHODS -----------

    def get_checklists(self):
        checklists = []

        query = "SELECT * FROM checklist"
        for checklist in self.get_mutiple_rows_query(query):
            checklists.append(Checklist(checklist[0], checklist[1]))

        return checklists
    
    def get_checklist_items(self, checklist_id):
        checklist_items = []

        query = "SELECT * FROM checklist_item WHERE checklist_id = ?"
        for item in self.get_mutiple_rows_query(query, (checklist_id, )):
            checklist_items.append(ChecklistItem(item[0], item[1], item[2], item[3], item[4]))

        return checklist_items

    def add_checklist(self, name):
        insert_query = "INSERT INTO checklist (name) VALUES (?)"
        return self.modify_db_query(insert_query, (name, )), self.get_last_row_id()
    
    def edit_checklist(self, id, name):
        update_query = "UPDATE checklist SET name = ? WHERE id = ?"
        return self.modify_db_query(update_query, (name, id))
    
    def remove_checklist(self, id):
        delete_query = "DELETE FROM checklist WHERE id = ?"
        return self.modify_db_query(delete_query, (id,))
    
    def complete_checklist_item(self, id):
        complete_query = ("UPDATE checklist_item SET is_complete = true WHERE id = ?")
        return self.modify_db_query(complete_query, (id, ))
    
    def undo_complete_checklist_item(self, id):
        complete_query = ("UPDATE checklist_item SET is_complete = false WHERE id = ?")
        return self.modify_db_query(complete_query, (id,))
    
    def add_checklist_item(self, checklist_id, name, description):
        insert_query = "INSERT INTO checklist_item (checklist_id, name, description, is_complete) VALUES (?, ?, ?, ?)"
        return self.modify_db_query(insert_query, (checklist_id, name, description, False)), self.get_last_row_id()
    
    def edit_checklist_item(self, id, name, description):
        update_query = ("UPDATE checklist_item SET name = ?, description = ? WHERE id = ?")
        return self.modify_db_query(update_query, (name, description, id))
    
    def delete_checklist_item(self, id):
        delete_query = "DELETE FROM checklist_item WHERE id = ?"
        return self.modify_db_query(delete_query, (id,))

#--------- HABIT METHODS -----------

    def get_habits(self):
        habits = []

        query = "SELECT * FROM habit"
        for habit in self.get_mutiple_rows_query(query):
            habits.append(Habit(habit[0], habit[1], habit[2], habit[3], habit[4], habit[5], habit[6]))

        return habits
    
    def get_daily_habits(self):
        habits = []

        query = "SELECT * FROM habit WHERE frequency = 'daily'"
        for habit in self.get_mutiple_rows_query(query):
            habits.append(Habit(habit[0], habit[1], habit[2], habit[3], habit[4], habit[5], habit[6]))

        return habits
    
    def get_weekly_habits(self):
        habits = []

        query = "SELECT * FROM habit WHERE frequency = 'weekly'"
        for habit in self.get_mutiple_rows_query(query):
            habits.append(Habit(habit[0], habit[1], habit[2], habit[3], habit[4], habit[5], habit[6]))

        return habits

    def add_habit(self, name, reward, times_needed, img, frequency):
        insert_query = "INSERT INTO habit (name, reward, times_completed, times_needed, img, frequency) VALUES (?,?,?,?,?,?)"
        return self.modify_db_query(insert_query, (name, reward, 0, times_needed, img, frequency)), self.get_last_row_id()
    
    def edit_habit(self, id, name, reward, times_completed, times_needed, img, frequency):
        update_query = "UPDATE habit SET name = ?, reward = ?, times_completed = ?, times_needed = ?, img = ?, frequency = ? WHERE id = ?"
        return self.modify_db_query(update_query, (name, reward, times_completed, times_needed, img, frequency, id))
    
    def delete_habit(self, id):
        delete_query = "DELETE FROM habit WHERE id = ?"
        return self.modify_db_query(delete_query, (id,))
    
    def complete_habit(self, id):
        update_query = "UPDATE habit SET times_completed = times_completed + 1 WHERE id = ?"
        return self.modify_db_query(update_query, (id, ))
    
#--------- NOTE METHODS -----------

    def get_all_notes(self):
        notes = []

        query = "SELECT * FROM note"
        for note in self.get_mutiple_rows_query(query):
            notes.append(Note(note[0], note[1], note[2], note[3], note[4]))

        return notes

    def get_notes_list(self):
        notes = []

        query = "SELECT id, name, date_created, date_modified FROM note"
        for note in self.get_mutiple_rows_query(query):
            notes.append(NoteInfo(note[0], note[1], note[2], note[3]))

        return notes
    
    
    def get_notes_list_associated_with_tags(self, tags):
        notes = []
        select_query = "SELECT id, name, date_created, date_modified FROM note, note_tag WHERE "
    
    def get_note(self, id):
        query = "SELECT * FROM note WHERE id = ?"
        note = self.get_single_row_query(query, (id, ))
        return note

    def add_note(self, name, body, date_created, date_modified):
        insert_query = "INSERT INTO note (name, body, date_created, date_modified) VALUES (?,?,?,?)"
        return self.modify_db_query(insert_query, (name, body, date_created, date_modified)), self.get_last_row_id()
    
    def apply_tags_to_note(self, note_id, tags):
        rows = 0
        
        delete_query = ("DELETE FROM note_tag WHERE note_id = ?")
        self.modify_db_query(delete_query, (note_id,))

        insert_query = ("INSERT INTO note_tag(note_id, tag_id) VALUES (?, ?)")
        for tag in tags:
            rows += self.modify_db_query(insert_query, (note_id, tag))

        return 1 if rows > 0 else 0
    
    def edit_note(self, id, name, body, date_created, date_modified):
        update_query = "UPDATE note SET name = ?, body = ?, date_created = ?, date_modified = ? WHERE id = ?"
        return self.modify_db_query(update_query, (name, body, date_created, date_modified, id))
    
    def delete_note(self, id):
        delete_query = "DELETE FROM note WHERE id = ?"
        return self.modify_db_query(delete_query, (id,))
    
    def apply_tags_to_notes(self, note_id, tags):
        rows = 0
        
        delete_query = ("DELETE FROM note_tag WHERE note_id = ?")
        self.modify_db_query(delete_query, (note_id,))

        insert_query = ("INSERT INTO note_tag(note_id, tag_id) VALUES (?, ?)")
        for tag in tags:
            rows += self.modify_db_query(insert_query, (note_id, tag))

        return 1 if rows > 0 else 0
    
    def get_tags(self):
        tags = []
        select_query = "SELECT * FROM tag"
        for tag in self.get_mutiple_rows_query(select_query):
            tags.append(Tag(tag[0], tag[1]))
        return tags
    
    def add_tag(self, name):
        insert_query = "INSERT INTO tag (name) VALUES (?)"
        return self.modify_db_query(insert_query, (name, )), self.get_last_row_id()
    
    def remove_tag(self, id):
        delete_query = "DELETE FROM tag WHERE id = ?"
        return self.modify_db_query(delete_query, (id,))
    
    def rename_tag(self, id, name):
        update_query = "UPDATE tag SET name = ? WHERE id = ?"
        return self.modify_db_query(update_query, (name, id))
    
    def get_tags_associated_with_note(self, note_id):
        tags = []
        select_query = "SELECT tag_id FROM note_tag WHERE note_id = ? ORDER BY tag_id"
        for tag_id in self.get_mutiple_rows_query(select_query, (note_id, )):
            tags.append(tag_id[0])

        return tags
    
#--------- CALENDAR METHODS -----------

    def get_event_types(self):
        types = []
        select_query = "SELECT * FROM calendar_event_type"
        for event_type in self.get_mutiple_rows_query(select_query):
            types.append(EventType(event_type[0], event_type[1], event_type[2], event_type[3]))
        return types
    
    def get_event_groups(self):
        groups = []
        select_query = "SELECT * FROM calendar_event_group"
        for event_group in self.get_mutiple_rows_query(select_query):
            groups.append(EventGroup(event_group[0], event_group[1]))
        return groups
    
    def get_events(self, date_start, date_end):
        events = []
        select_query = "SELECT * FROM calendar_event WHERE (start BETWEEN ? AND ?) OR (end BETWEEN ? AND ?) OR rrule IS NOT NULL"
        for event_type in self.get_mutiple_rows_query(select_query, (date_start, date_end, date_start, date_end)):
            events.append(Event(
                event_type[0], 
                event_type[1], 
                event_type[2], 
                event_type[3],
                event_type[4], 
                event_type[5], 
                event_type[6], 
                event_type[7],
                event_type[8], 
                event_type[9],
                event_type[10]
            ))
        return events
    
    def edit_event(
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
        update_query = """
            UPDATE calendar_event 
                SET 
                    group_id = ?,
                    event_type_id = ?,
                    title = ?,
                    all_day = ?,
                    start = ?,
                    end = ?,
                    rrule = ?,
                    url = ?,
                    editable = ?,
                    extended_props = ?
                WHERE id = ?"""
        return self.modify_db_query(
            update_query, 
            (
                group_id,
                event_type_id,
                title,
                all_day,
                start,
                end,
                rrule,
                url,
                editable,
                extended_props, 
                id
            )
        )
    

    def add_event(
        self,
        group_id,
        title,
        all_day,
        start,
        end,
        rrule,
        url,
        editable,
        extended_props
    ):  
        update_query = """
            INSERT INTO calendar_event(
                group_id
                title,
                all_day,
                start,
                end,
                rrule,
                url,
                editable,
                extended_props
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"""
        
        return (self.modify_db_query(
            update_query, 
            (
                group_id,
                title,
                all_day,
                start,
                end,
                rrule,
                url,
                editable,
                extended_props
            )
        ), self.get_last_row_id())
    
    def remove_event(self, id):
        delete_query = "DELETE FROM calendar_event WHERE id = ?"
        return self.modify_db_query(delete_query, (id,))
    
    def add_event_type(self, name, color, background_color):
        insert_query = "INSERT OR IGNORE INTO calendar_event_type(name, color, background_color) VALUES (?, ?, ?)"
        return (self.modify_db_query(insert_query, (name, color, background_color)), self.get_last_row_id())
    
    def remove_event_type(self, id):
        delete_query = "DELETE FROM calendar_event_type WHERE id = ?"
        return self.modify_db_query(delete_query, (id,))

    def edit_event_type(self, id, name, color, background_color):
        update_query = "UPDATE calendar_event_type SET name = ?, color = ?, background_color = ? WHERE id = ?"
        return self.modify_db_query(update_query, (name, color, background_color, id))
    
    def add_event_group(self, name):
        insert_query = "INSERT OR IGNORE INTO calendar_event_group(name) VALUES (?)"
        return (self.modify_db_query(insert_query, (name, )), self.get_last_row_id())
    
    def remove_event_group(self, id):
        delete_query = "DELETE FROM calendar_event_group WHERE id = ?"
        return self.modify_db_query(delete_query, (id,))

    def edit_event_group(self, id, name):
        update_query = "UPDATE calendar_event_group SET name = ? WHERE id = ?"
        return self.modify_db_query(update_query, (name, id))

#--------- STORE METHODS -----------