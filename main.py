import mysql.connector as mysql;

if __name__ == "__main__":
    db = mysql.connect(host="localhost", user="angelph", passwd="Nccrypls2469~", auth_plugin='caching_sha2_password', database="raccoon_to_do")
    id = 1

    while True:

        print("\nYour to do list: \n")
        select_query = ("SELECT id, name, is_completed FROM Task WHERE user_id = %s")
        with db.cursor() as cursor:
            cursor.execute(select_query, (id,))
            for row in cursor.fetchall():
                line = "\u2714  " if row[2] else "   "
                line += str(row[0]) + ". " + str(row[1]) + "\n"
                print(line)

        print()
        user_input = input("Enter a number corresponding to the option you would like to take below. \n\n1. Add a new task\n2. Remove a task \n3. Mark a task as completed \n4. Quit\n\n> ")
        if user_input == "4":
            print("Quitting program...")
            break
        elif user_input == "1":
            
            task_name = input("\nEnter the name of the task you would like to add to the list. \n\n> ")
            insert_query = ("INSERT INTO Task (user_id, name) VALUE (%s, %s)")

            with db.cursor() as cursor:
                cursor.execute(insert_query, (id, task_name))
                db.commit()
            
        elif user_input == "2":
            task_to_delete = input("\nEnter the id of the task you would like to remove.\n\n> ")
            delete_query = "DELETE FROM task WHERE id = %s"

            with db.cursor() as cursor:
                cursor.execute(delete_query, (task_to_delete,))
                db.commit()
                print()
                print(cursor.rowcount, "task(s) deleted")
                

        elif user_input == "3":
            task_to_complete = input("\nEnter the id of the task you would like to mark as complete.\n\n> ")
            complete_query = ("UPDATE Task SET is_completed = true WHERE id = %s")

            with db.cursor() as cursor:
                cursor.execute(complete_query, (task_to_complete,))
                db.commit()

        else:
            print("Invalid input, please try again.")

    db.close()