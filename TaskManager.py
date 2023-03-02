
import sqlite3
from Task import Task
from StoreItem import StoreItem
from InventoryItem import InventoryItem
import threading
import datetime

class TaskManager:
    def __init__(self, id):
        self.db = sqlite3.connect("producktivity.db", check_same_thread=False)
        self.cursor = self.db.cursor()
        self.lock = threading.Lock()

    def close(self):
        print("Closing DB connection...")
        self.db.close()
        print("Closed.")


    def get_tasks(self):
        tasks = []
        select_query = ("SELECT id, name, is_completed, reward FROM task")
        try:
            self.lock.acquire(True)
            self.cursor.execute(select_query)
            for row in self.cursor.fetchall():
                tasks.append(Task(row[0], row[1], row[2], row[3]))
        except Exception as e:
            print(e)
        finally:
            self.lock.release()
        

        return tasks
    
    def get_store_items(self):
        items = []
        select_query = ("SELECT id, name, cost, img_src, stock FROM rewards")
        try:
            self.lock.acquire(True)
            self.cursor.execute(select_query)
            for row in self.cursor.fetchall():
                items.append(StoreItem(row[0], row[1], row[2],row[3], row[4]))
        except Exception as e:
            print(e)
        finally:
            self.lock.release()
        

        return items
    

    def get_inventory_items(self):
        items = []
        select_query = ("SELECT id, store_item_id, name, cost, date_purchased, img_src FROM inventory")
        try:
            self.lock.acquire(True)
            self.cursor.execute(select_query)
            for row in self.cursor.fetchall():
                items.append(InventoryItem(row[0], row[1], row[2],row[3], row[4], row[5]))
        except Exception as e:
            print(e)
        finally:
            self.lock.release()
        
        return items
    
    def purchase_item(self, id):
        #check if there is stock for item and pull item information if purchase is possible
        check_query = "SELECT name, cost, img_src, stock FROM rewards WHERE id = ?"
        item_info = {"name": "", "cost": -1, "img_src": "", "stock": -1}
        try:
            self.lock.acquire(True)
            self.cursor.execute(check_query, (id,))
            res = self.cursor.fetchone()
            item_info["name"] = res[0]
            item_info["cost"] = res[1]
            item_info["img_src"] = res[2]
            item_info["stock"] = res[3]
        except Exception as e:
            print(e)
        finally:
            self.lock.release()

        if item_info["stock"] <= 0:
            return None
        
        #add item to inventory
        insert_query = "INSERT INTO inventory (store_item_id, name, cost, date_purchased, img_src) VALUES (?,?,?,?,?)"
        row_count = 0
        try:
            self.lock.acquire(True)
            self.cursor.execute(insert_query, (id, item_info["name"], item_info["cost"], datetime.datetime.now(), item_info["img_src"]))
            row_count += self.cursor.rowcount
            self.db.commit()
        except Exception as e:
            print(e)
        finally:
            self.lock.release()

        #subtract one from stock in rewards
        update_query = "UPDATE rewards SET stock = stock - 1 WHERE id = ?"

        try:
            self.lock.acquire(True)
            self.cursor.execute(update_query, (id,))
            self.db.commit()
            row_count += self.cursor.rowcount            
        except Exception as e:
            print(e)
        finally:
            self.lock.release()

        return (1 if row_count == 2 else 0)
    
    def add_task(self, name, reward):
        insert_query = ("INSERT INTO Task (name, is_completed, reward) VALUES (?, ?, ?)")
        row_count = 0

        try:
            self.lock.acquire(True)
            self.cursor.execute(insert_query, (name, False, reward))
            row_count = self.cursor.rowcount
            self.db.commit()
        except Exception as e:
            print(e)
        finally:
            self.lock.release()

        return row_count

    def remove_task(self, task_id):
        delete_query = "DELETE FROM task WHERE id = ?"
        row_count = 0

        try:
            self.lock.acquire(True)
            self.cursor.execute(delete_query, (task_id,))
            row_count = self.cursor.rowcount
            self.db.commit()
        except Exception as e:
            print(e)
        finally:
            self.lock.release()
        
        return row_count

    def complete_task(self, task_id):
        complete_query = ("UPDATE Task SET is_completed = true WHERE id = ?")
        row_count = 0

        try:
            self.lock.acquire(True)
            self.cursor.execute(complete_query, (task_id,))
            row_count = self.cursor.rowcount
            if row_count > 0:
                self.db.commit()
        except Exception as e:
            print(e)
        finally:
            self.lock.release()
        
        return row_count
    
    def get_wallet(self):
        select_query = "SELECT value FROM user_info WHERE key = 'wallet'"
        wallet = 0

        try:
            self.lock.acquire(True)
            self.cursor.execute(select_query)
            wallet = int(self.cursor.fetchone()[0])
        except Exception as e:
            print(e)
        finally:
            self.lock.release()

        return wallet
    
    def get_name(self):
        select_query = "SELECT value FROM user_info WHERE key = 'name'"
        name = ""

        try:
            self.lock.acquire(True)
            self.cursor.execute(select_query)
            name = self.cursor.fetchone()[0]
        except Exception as e:
            print(e)
        finally:
            self.lock.release()

        return name
    
    def update_wallet(self, new_value):
        update_query = "UPDATE user_info SET value = ? WHERE key = 'wallet'"
        row_count = 0

        try:
            self.lock.acquire(True)
            self.cursor.execute(update_query, (new_value,))
            self.db.commit()
            row_count = self.cursor.rowcount            
        except Exception as e:
            print(e)
        finally:
            self.lock.release()

        return row_count