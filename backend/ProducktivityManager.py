import sqlite3
import threading
import datetime
from Task import Task
from List import List

class ProducktivityManager:
    def __init__(self):
        self.db = sqlite3.connect("producktivity.db", check_same_thread=False)
        self.db.execute("PRAGMA foreign_keys = 1")
        self.cursor = self.db.cursor()
        self.lock = threading.Lock()

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


        if tables == 0:
            #create user_info table
            print("user_info not found, creating table... ")
            create_user_info_commands = ["CREATE TABLE IF NOT EXISTS user_info(key TEXT PRIMARY KEY, value TEXT)",
                                          "INSERT OR IGNORE INTO user_info VALUES ('username', 'Jellycat')",
                                          "INSERT OR IGNORE INTO user_info VALUES ('wallet', 0)",
                                          "INSERT OR IGNORE INTO user_info VALUES ('experience', 0)"
                                          ]
            for command in create_user_info_commands:
                self.modify_db_query(command)

            create_task_command = """CREATE TABLE IF NOT EXISTS task(
                                   id INTEGER PRIMARY KEY,
                                   name TEXT, 
                                   description TEXT,  
                                   is_completed BOOLEAN, 
                                   reward INTEGER, 
                                   priority INTEGER, 
                                   due_date DATETIME, 
                                   start_date DATETIME, 
                                   complete_date DATETIME, 
                                   type TEXT,
                                   parent_id INTEGER)"""
            
            create_list_command = "CREATE TABLE list (id INTEGER PRIMARY KEY, name TEXT UNIQUE)"
            create_task_list_command = """CREATE TABLE task_list(
                                        task_id INTEGER, 
                                        list_id INTEGER, 
                                        PRIMARY KEY (task_id, list_id), 
                                        FOREIGN KEY (task_id) REFERENCES task(id) ON DELETE CASCADE ON UPDATE CASCADE, 
                                        FOREIGN KEY (list_id) REFERENCES list(id) ON DELETE CASCADE ON UPDATE CASCADE)"""
            self.modify_db_query(create_task_command)
            self.modify_db_query(create_list_command)
            self.modify_db_query(create_task_list_command)
            
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
    
    def apply_lists_to_task(self, taskid, lists):
        rows = 0
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

    def complete_task(self, task_id):
        complete_query = ("UPDATE Task SET is_completed = true, complete_date = ? WHERE id = ?")
        return self.modify_db_query(complete_query, (datetime.datetime.now(), task_id))
    
    def undo_complete_task(self, task_id):
        complete_query = ("UPDATE Task SET is_completed = false, complete_date = NULL WHERE id = ?")
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