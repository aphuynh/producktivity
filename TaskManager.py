
import sqlite3
from Task import Task
from StoreItem import StoreItem
from InventoryItem import InventoryItem
from Category import Category
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

    def get_tasks(self, categories):
        tasks = []
        select_query = ("SELECT id, name, is_completed, reward, start_date, due_date, type FROM task")
        arguments_tuple = []
        if len(categories) > 0:
            select_query = ("SELECT t.id, t.name, t.is_completed, t.reward, t.start_date, t.due_date, t.type " 
                            "FROM task t, task_categories tc, categories c WHERE t.id = tc.task_id AND tc.category_id = c.id AND (")
            for i, category in enumerate(categories):
                if i != 0:
                    select_query += " OR "
                select_query += "c.name = ?"

                arguments_tuple.append(category)

            select_query += ") GROUP BY t.id HAVING COUNT(c.id) = ?"

            arguments_tuple.append(len(categories))

        try:
            self.lock.acquire(True)
            self.cursor.execute(select_query, arguments_tuple)
            for row in self.cursor.fetchall():
                tasks.append(Task(row[0], row[1], row[2], row[3], row[4], row[5], row[6]))
        except Exception as e:
            print(e)
        finally:
            self.lock.release()
        

        return tasks
    
    def get_store_items(self, filter):
        items = []

        if filter == 'all':
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

        elif filter == 'featured':
            select_query = ("SELECT r.id, r.name, r.cost, r.img_src, r.stock FROM rewards r, banner_items bi, banner b "
                            "WHERE r.id = bi.reward_id AND b.id = bi.banner_id AND b.name = 'Featured'")
            try:
                self.lock.acquire(True)
                self.cursor.execute(select_query)
                for row in self.cursor.fetchall():
                    items.append(StoreItem(row[0], row[1], row[2],row[3], row[4]))
            except Exception as e:
                print(e)
            finally:
                self.lock.release()

        elif filter == 'unowned':
            select_query = ("SELECT id, name, cost, img_src, stock FROM rewards WHERE stock > 0")
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

    def get_inventory_items(self, favorite):
        items = []
        select_query = ("SELECT id, store_item_id, name, cost, date_purchased, img_src, favorite FROM inventory")
        if favorite:
            select_query += " WHERE favorite = true"
        try:
            self.lock.acquire(True)
            self.cursor.execute(select_query)
            for row in self.cursor.fetchall():
                items.append(InventoryItem(row[0], row[1], row[2],row[3], row[4], row[5], row[6]))
        except Exception as e:
            print(e)
        finally:
            self.lock.release()
        
        return items
    
    def purchase_item(self, id, cost):
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
            self.cursor.execute(insert_query, (id, item_info["name"], item_info["cost"] if not cost else cost, datetime.datetime.now(), item_info["img_src"]))
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
    
    def add_task(self, name, reward, type, due_date):
        insert_query = ("INSERT INTO Task (name, is_completed, reward, type, due_date, start_date) VALUES (?, ?, ?, ?, ?, ?)")
        row_count = 0

        try:
            self.lock.acquire(True)
            self.cursor.execute(insert_query, (name, False, reward, type, due_date, datetime.datetime.now()))
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

        if row_count:
            self.remove_from_task_categories([task_id], [])
        
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
    
    def create_category(self, category):
        row_count = 0
        insert_query = ("INSERT OR IGNORE INTO categories(name) VALUES (?)")

        try:
            self.lock.acquire(True)
            self.cursor.execute(insert_query, (category,))
            self.db.commit()
            row_count = self.cursor.rowcount            
        except Exception as e:
            print(e)
        finally:
            self.lock.release()

        return row_count
    
    def delete_category(self, category):
        row_count = 0
        select_query = "SELECT id FROM categories WHERE name = ?"
        category_id = 0
        try:
            self.lock.acquire(True)
            self.cursor.execute(select_query, (category,))
            self.db.commit()
            category_id = int(self.cursor.fetchone()[0])    
        except Exception as e:
            print(e)
        finally:
            self.lock.release()

        if category_id:

            delete_query = ("DELETE FROM categories WHERE id = ?")

            try:
                self.lock.acquire(True)
                self.cursor.execute(delete_query, (category_id,))
                self.db.commit()
                row_count = self.cursor.rowcount            
            except Exception as e:
                print(e)
            finally:
                self.lock.release()

            if row_count:
                self.remove_from_task_categories([], [category_id])

        return row_count
    
    def apply_categories(self, task_id, categories):
        row_count = 0
        for category in categories:
            row_count += self.apply_category(task_id, category)

        return row_count

    def apply_category(self, task_id, category):
        row_count = 0
        insert_query = ("INSERT OR IGNORE INTO task_categories(category_id, task_id) "
                        "SELECT c.id, ? FROM categories c WHERE c.name = ?")

        try:
            self.lock.acquire(True)
            self.cursor.execute(insert_query, (task_id, category))
            self.db.commit()
            row_count = self.cursor.rowcount            
        except Exception as e:
            print(e)
        finally:
            self.lock.release()

        return row_count
    
    def remove_categories(self, task_id, categories):
        row_count = 0
        for category in categories:
            row_count += self.remove_category(task_id, category)

        return row_count

    def remove_category(self, task_id, category):
        row_count = 0
        delete_query = ("DELETE FROM task_categories WHERE task_id = ? AND category_id = (SELECT id FROM categories WHERE name = ?)")

        try:
            self.lock.acquire(True)
            self.cursor.execute(delete_query, (task_id, category))
            self.db.commit()
            row_count = self.cursor.rowcount            
        except Exception as e:
            print(e)
        finally:
            self.lock.release()

        return row_count
    
    def get_categories(self):
        categories = []
        select_query = ("SELECT * FROM categories")

        try:
            self.lock.acquire(True)
            self.cursor.execute(select_query)
            for row in self.cursor.fetchall():
                categories.append(Category(row[0], row[1]))
        except Exception as e:
            print(e)
        finally:
            self.lock.release()

        return categories
    
    def update_task_progress(self):
        row_count = 0
        update_in_progress_query = "INSERT OR IGNORE INTO task_categories(category_id, task_id) SELECT 2, id FROM task WHERE is_completed = false;"

        try:
            self.lock.acquire(True)
            self.cursor.execute(update_in_progress_query)
            self.db.commit()
            row_count = self.cursor.rowcount            
        except Exception as e:
            print(e)
        finally:
            self.lock.release()

        return row_count
    
    def remove_from_task_categories(self, tasks, categories):
        row_count = 0
        if len(tasks) > 0 or len(categories) > 0:
            first = True
            delete_query = "DELETE FROM task_categories WHERE"
            for task in tasks:
                if not first:
                    delete_query += " OR"
                else: 
                    first = False

                delete_query += " task_id = " + str(task)


            for category in categories:
                if not first:
                    delete_query += " OR"
                else: 
                    first = False

                delete_query += " category_id = " + str(category)

            try:
                self.lock.acquire(True)
                self.cursor.execute(delete_query)
                self.db.commit()
                row_count = self.cursor.rowcount            
            except Exception as e:
                print(e)
            finally:
                self.lock.release()

        return row_count
    
    def toggle_category(self, task_id, category):
        row_count = self.remove_category(task_id, category)
        if not row_count:
            row_count = self.apply_category(task_id, category)
        else:
            row_count = -1

        return row_count
        
    def refreshFeatured(self):
        select_query = "SELECT id, refresh_seconds, last_refresh FROM banner WHERE name = 'Featured'"
        banner_id = -1
        refresh_seconds = -1
        last_refresh = None
        return_val = -1

        try:
            self.lock.acquire(True)
            self.cursor.execute(select_query)
            data = self.cursor.fetchone()
            banner_id = data[0]
            refresh_seconds = data[1]
            last_refresh = data[2]
        except Exception as e:
            print(e)
            return_val = 0
        finally:
            self.lock.release()

        if return_val == 0:
            return 0
        
        time_now = datetime.datetime.now()
        time_passed = abs(time_now - datetime.datetime.strptime(last_refresh, "%Y-%m-%d %H:%M:%S.%f")).total_seconds() if last_refresh else None
        print(time_passed)
        if not last_refresh or (time_passed >= int(refresh_seconds)):
            #remove previous featured items
            delete_query = ("DELETE FROM banner_items WHERE banner_id = ?")

            try:
                self.lock.acquire(True)
                self.cursor.execute(delete_query, (banner_id,))
                self.db.commit()
            except Exception as e:
                print(e)
                return_val = 0
            finally:
                self.lock.release()

            if return_val == 0:
                return 0

            insert_query = ("INSERT INTO banner_items(banner_id, reward_id) SELECT ?, id FROM rewards WHERE stock > 0 ORDER BY RANDOM() LIMIT 4;" )

            try:
                self.lock.acquire(True)
                self.cursor.execute(insert_query, (banner_id,))
                self.db.commit()
            except Exception as e:
                print(e)
                return_val = 0
            finally:
                self.lock.release()

            if return_val == 0:
                return 0
            
            update_query = ("UPDATE banner SET last_refresh = ? WHERE id = ?")

            try:
                self.lock.acquire(True)
                self.cursor.execute(update_query, (time_now, banner_id))
                self.db.commit()
            except Exception as e:
                print(e)
                return_val = 0
            finally:
                self.lock.release()

            if return_val == 0:
                return 0
            
        return 1
    