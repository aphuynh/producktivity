from flask import Flask, redirect, url_for, request
from TaskManager import TaskManager
import json

app = Flask(__name__)
task_manager = TaskManager(1)

@app.route("/tasks", methods = ["POST", "GET"])
def tasks():
    tasks = None
    if request.method == 'POST':
        data = request.get_json()
        tasks = task_manager.get_tasks(data['categories'])
    return json.dumps(tasks, default=lambda x: x.__dict__)

@app.route("/categories")
def categories():
    categories = task_manager.get_categories()
    return json.dumps(categories, default=lambda x: x.__dict__)

@app.route("/wallet")
def wallet():
    wallet = task_manager.get_wallet()
    return json.dumps(wallet)

@app.route("/store/<filter>")
def store(filter):
    store = task_manager.get_store_items(filter)
    return json.dumps(store, default=lambda x: x.__dict__)

@app.route("/inventory/<filter>")
def inventory(filter):
    isFavorites = True if filter == "favorites" else False
    inventory = task_manager.get_inventory_items(isFavorites)
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

@app.route("/purchase", methods = ["POST", "GET"])
def purchase_item():
    result = 0 
    if request.method == 'POST':
        data = request.get_json()
        result = task_manager.purchase_item(data['task_id'], data['cost'])
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
        result = task_manager.add_task(data['name'], data['reward'], data['type'], data['due_date'])
    return json.dumps("succeeded" if result else "failed")    

@app.route("/add_categories", methods = ["POST", "GET"])
def add_categories():
    result = 0 
    if request.method == 'POST':
        data = request.get_json()
        result = task_manager.apply_categories(data['task_id'], data['categories'])

    return json.dumps("succeeded" if result else "failed")  

@app.route("/remove_categories", methods = ["POST", "GET"])
def remove_categories():
    result = 0 
    if request.method == 'POST':
        data = request.get_json()
        result = task_manager.remove_categories(data['task_id'], data['categories'])

    return json.dumps("succeeded" if result else "failed")  

@app.route("/toggle_category", methods = ["POST", "GET"])
def toggle_category():
    result = 0 
    if request.method == 'POST':
        data = request.get_json()
        result = task_manager.toggle_category(data['task_id'], data['category'])

    return json.dumps("succeeded" if result != 0 else "failed")  

@app.route("/update_progress")
def update_progress():
    result = task_manager.update_task_progress()
    return json.dumps("succeeded" if result else "failed")

@app.route("/create_category/<name>")
def create_category(name):
    result = task_manager.create_category(name)
    return json.dumps("succeeded" if result else "failed")

@app.route("/delete_category/<name>")
def delete_category(name):
    result = task_manager.delete_category(name)
    return json.dumps("succeeded" if result else "failed")

@app.route("/refresh")
def refresh_store():
    result = task_manager.refreshFeatured()
    return json.dumps("succeeded" if result else "failed")

if __name__ == "__main__":

    app.run(debug=True)