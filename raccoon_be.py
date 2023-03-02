from flask import Flask, redirect, url_for, request
from TaskManager import TaskManager
import json

app = Flask(__name__)
task_manager = TaskManager(1)

@app.route("/tasks")
def tasks():
    tasks = task_manager.get_tasks()
    return json.dumps(tasks, default=lambda x: x.__dict__)

@app.route("/wallet")
def wallet():
    wallet = task_manager.get_wallet()
    return json.dumps(wallet)

@app.route("/store")
def store():
    store = task_manager.get_store_items()
    return json.dumps(store, default=lambda x: x.__dict__)

@app.route("/inventory")
def inventory():
    inventory = task_manager.get_inventory_items()
    return json.dumps(inventory, default=lambda x: x.__dict__)

@app.route("/name")
def name():
    name = task_manager.get_name()
    return json.dumps(name)

@app.route("/update_wallet/<amount>")
def update_wallet(amount):
    result = task_manager.update_wallet(amount)
    return json.dumps("succeeded" if result else "failed")

@app.route("/complete/<id>")
def complete_task(id):
    result = task_manager.complete_task(id)
    return json.dumps("succeeded" if result else "failed")

@app.route("/purchase/<id>")
def purchase_item(id):
    result = task_manager.purchase_item(id)
    return json.dumps("succeeded" if result else "failed")

@app.route("/remove/<id>")
def remove_task(id):
    result = task_manager.remove_task(id)
    return json.dumps("succeeded" if result else "failed")

@app.route("/add", methods = ["POST", "GET"])
def add_task():
    result = 0
    if request.method == 'POST':
        data = request.get_json()
        result = task_manager.add_task(data['name'], data['reward'])
    return json.dumps("succeeded" if result else "failed")    


if __name__ == "__main__":

    app.run(debug=True)