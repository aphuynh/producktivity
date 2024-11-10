from flask import Flask, request
from flask_cors import CORS
from ProducktivityManager import ProducktivityManager
import json

app = Flask(__name__)
CORS(app)
task_manager = ProducktivityManager()

# Task Methods

@app.route("/tasks/ordered")
def ordered_tasks():
    tasks = task_manager.get_tasks_ordered()
    return json.dumps(tasks, default=lambda x: x.__dict__)

@app.route("/tasks/all")
def all_tasks():
    tasks = task_manager.get_tasks_all()
    return json.dumps(tasks, default=lambda x: x.__dict__)

@app.route("/add", methods = ["POST", "GET"])
def add_task():
    result = 0
    if request.method == 'POST':
        data = request.get_json()
        task_id = task_manager.add_task(data['name'], data['description'], data['reward'], data['priority'], data['due_date'], data['type'], data['parent_id'])

        if task_id != -1:
            result = task_manager.apply_lists_to_task(task_id, data['lists'])
    return json.dumps(task_id if result else -1)

@app.route("/edit_task", methods = ["POST", "GET"])
def edit_task():
    result = 0
    if request.method == 'POST':
        data = request.get_json()
        result = task_manager.edit_task(data['id'], data['name'], data['description'], data['reward'], data['priority'], data['due_date'], data['type'], data['parent_id'])
        if result:
            result = task_manager.apply_lists_to_task(data['id'], data['lists'])
    return json.dumps(1 if result else 0)   

@app.route("/complete/<id>")
def complete_task(id):
    result = task_manager.complete_task(id)
    return json.dumps(1 if result else 0) 

@app.route("/undo_complete/<id>")
def undo_complete_task(id):
    result = task_manager.undo_complete_task(id)
    return json.dumps(1 if result else 0) 

@app.route("/remove/<id>")
def remove_task(id):
    result = task_manager.delete_task(id)
    return json.dumps(1 if result else 0)

@app.route("/lists")
def get_lists():
    lists = task_manager.get_lists()
    return json.dumps(lists, default=lambda x: x.__dict__)

@app.route("/add_list/<name>")
def add_list(name):
    result, id = task_manager.add_list(name)
    return json.dumps((result, id))

@app.route("/remove_list/<id>")
def remove_list(id):
    result = task_manager.remove_list(id)
    return json.dumps(1 if result else 0)

@app.route("/rename_list", methods = ["POST", "GET"])
def rename_list():
    result = 0
    if request.method == 'POST':
        data = request.get_json()
        result = task_manager.rename_list(data['id'], data['name']);

    return json.dumps(1 if result else 0)

@app.route("/list_task_map")
def get_list_task_map():
    list_task_map = task_manager.get_list_task_map()
    return json.dumps(list_task_map, default=lambda x: x.__dict__)

@app.route("/task_lists/<task_id>")
def get_lists_by_task_id(task_id):
    lists = task_manager.get_lists_associated_with_task(task_id)
    return json.dumps(lists, default=lambda x: x.__dict__)

# Checklist Methods

@app.route("/checklists")
def get_checklists():
    checklists = task_manager.get_checklists()
    return json.dumps(checklists, default=lambda x: x.__dict__)

@app.route("/checklist_items/<id>")
def get_checklist_items(id):
    checklist_items = task_manager.get_checklist_items(id)
    return json.dumps(checklist_items, default=lambda x: x.__dict__)

@app.route("/add_checklist/<name>")
def add_checklist(name):
    result, id = task_manager.add_checklist(name)
    return json.dumps((result, id))

@app.route("/edit_checklist/<id>/<name>")
def edit_checklist(id, name):
    result = task_manager.edit_checklist(id, name)
    print(result)
    return json.dumps(1 if result > 0 else 0)

@app.route("/remove_checklist/<id>")
def remove_checklist(id):
    result = task_manager.remove_checklist(id)
    return json.dumps(1 if result else 0)

@app.route("/complete_checklist_item/<id>")
def complete_checklist_item(id):
    result = task_manager.complete_checklist_item(id)
    return json.dumps(1 if result else 0) 

@app.route("/undo_complete_checklist_item/<id>")
def undo_complete_checklist_item(id):
    result = task_manager.undo_complete_checklist_item(id)
    return json.dumps(1 if result else 0) 

@app.route("/add_checklist_item", methods = ["POST", "GET"])
def add_checklist_item():
    result = 0
    if request.method == 'POST':
        data = request.get_json()
        checklist_item_id = task_manager.add_checklist_item(data['checklist_id'], data['name'], data['description'])

    return json.dumps(checklist_item_id if result else -1)

@app.route("/edit_checklist_item", methods = ["POST", "GET"])
def edit_checklist_item():
    result = 0
    if request.method == 'POST':
        data = request.get_json()
        result = task_manager.edit_checklist_item(data['id'], data['name'], data['description'])
    return json.dumps(1 if result else 0)  

@app.route("/remove_checklist_item/<id>")
def remove_checklist_item(id):
    result = task_manager.delete_checklist_item(id)
    return json.dumps(1 if result else 0)

# Habit Methods

@app.route("/habits")
def get_habits():
    habits = task_manager.get_habits()
    return json.dumps(habits, default=lambda x: x.__dict__)

@app.route("/habits/daily")
def get_daily_habits():
    habits = task_manager.get_daily_habits()
    return json.dumps(habits, default=lambda x: x.__dict__)

@app.route("/habits/weekly")
def get_weekly_habits():
    habits = task_manager.get_weekly_habits()
    return json.dumps(habits, default=lambda x: x.__dict__)

@app.route("/add_habit", methods =["POST", "GET"])
def add_habit():
    result = 0
    if request.method == 'POST':
        data = request.get_json()
        habit_id = task_manager.add_habit(data['name'], data['reward'], data['times_needed'], data['img'], data['frequency'])

    return json.dumps(habit_id if result else -1)

@app.route("/edit_habit", methods = ["POST", "GET"])
def edit_habit():
    result = 0
    if request.method == 'POST':
        data = request.get_json()
        result = task_manager.edit_habit(data['id'], data['name'], data['reward'], data['times_completed'], data['times_needed'], data['img'], data['frequency'])
    return json.dumps(1 if result else 0)  

@app.route("/delete_habit/<id>")
def delete_habit(id):
    result = task_manager.delete_habit(id)
    return json.dumps(1 if result else 0)

@app.route("/complete_habit/<id>")
def complete_habit(id):
    result = task_manager.complete_habit(id)
    return json.dumps(1 if result else 0)

# Account Methods

@app.route("/username")
def get_username():
    return json.dumps(task_manager.get_username())

@app.route("/wallet")
def get_wallet():
    return json.dumps(task_manager.get_wallet())

@app.route("/update_wallet", methods = ["POST", "GET"])
def update_wallet():
    result = 0
    if request.method == 'POST':
        data = request.get_json()
        result = task_manager.update_wallet(data['transaction_amount'])

    return json.dumps(1 if result else 0)

if __name__ == "__main__":
    app.run(port=5001, debug=True)