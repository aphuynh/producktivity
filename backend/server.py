from flask import Flask, redirect, url_for, request
from ProducktivityManager import ProducktivityManager
import json

app = Flask(__name__)
task_manager = ProducktivityManager()

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

@app.route("/complete/<id>")
def complete_task(id):
    result = task_manager.complete_task(id)
    return json.dumps("succeeded" if result else "failed") 

@app.route("/undo_complete/<id>")
def undo_complete_task(id):
    result = task_manager.undo_complete_task(id)
    return json.dumps("succeeded" if result else "failed") 

@app.route("/remove/<id>")
def remove_task(id):
    result = task_manager.delete_task(id)
    return json.dumps("succeeded" if result else "failed")

@app.route("/lists")
def get_lists():
    lists = task_manager.get_lists()
    return json.dumps(lists, default=lambda x: x.__dict__)

@app.route("/add_list/<name>")
def add_list(name):
    result, id = task_manager.add_list(name)
    return json.dumps((result, id))


@app.route("/list_task_map")
def get_list_task_map():
    list_task_map = task_manager.get_list_task_map()
    return json.dumps(list_task_map, default=lambda x: x.__dict__)

@app.route("/task_lists/<task_id>")
def get_lists_by_task_id(task_id):
    lists = task_manager.get_lists_associated_with_task(task_id)
    return json.dumps(lists, default=lambda x: x.__dict__)

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

    return json.dumps("succeeded" if result else "failed")

if __name__ == "__main__":
    app.run(port=5001, debug=True)